/* eslint-disable ts/explicit-function-return-type */
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { Cron } from 'croner'

export type JsonSchedulerStatus = 'running' | 'paused'
export type JsonSchedulerCronSource = 'use' | 'update'
export type JsonSchedulerRunReason = 'schedule' | 'manual'
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

export interface JsonSchedulerExtra {
  [key: string]: JsonValue | undefined
}
export interface JsonSchedulerJobInput extends JsonSchedulerExtra {
  id: string
  cron: string
}
export interface JsonSchedulerJobPatch extends JsonSchedulerExtra {
  id: string
  cron?: string
}
export type JsonSchedulerJobRef = { id: string } | string

export interface JsonSchedulerRunContext {
  id: string
  cron: string
  reason: JsonSchedulerRunReason
  startedAt: Date
  job: JsonSchedulerJob
}

export type JsonSchedulerHandler = (context: JsonSchedulerRunContext) => unknown

export interface JsonSchedulerJob {
  id: string
  cron: string
  status: JsonSchedulerStatus
  hasHandler: boolean
  nextRunAt: string | null
  lastRunAt: string | null
  lastError: string | null
  runCount: number
  createdAt: string
  updatedAt: string
  [key: string]: JsonValue
}

export interface JsonSchedulerErrorContext {
  phase: 'save' | 'run'
  id?: string
}

export interface JsonSchedulerOptions {
  timezone?: string
  protect?: boolean
  unref?: boolean
  onError?: (error: unknown, context: JsonSchedulerErrorContext) => void
}

export interface JsonScheduler {
  readonly filePath: string
  ready: () => Promise<void>
  use: (input: JsonSchedulerJobInput, handler: JsonSchedulerHandler) => () => boolean
  update: (patch: JsonSchedulerJobPatch) => boolean
  remove: (ref: JsonSchedulerJobRef) => boolean
  trigger: (ref: JsonSchedulerJobRef) => Promise<void>
  stop: (ref: JsonSchedulerJobRef) => boolean
  start: (ref: JsonSchedulerJobRef) => boolean
  stopAll: () => void
  startAll: () => void
  jobs: () => JsonSchedulerJob[]
  flush: () => Promise<void>
  dispose: () => Promise<void>
}

const RESERVED_KEYS = new Set([
  'id',
  'cron',
  'status',
  'cronSource',
  'createdAt',
  'updatedAt',
  'lastRunAt',
  'lastError',
  'runCount',
  'hasHandler',
  'nextRunAt',
])

interface JobRecord {
  id: string
  cron: string
  status: JsonSchedulerStatus
  cronSource: JsonSchedulerCronSource
  createdAt: string
  updatedAt: string
  lastRunAt: string | null
  lastError: string | null
  runCount: number
  extra: Record<string, JsonValue>
  handler?: JsonSchedulerHandler
  job?: Cron
}

const nowIso = () => new Date().toISOString()
const messageOf = (err: unknown) => err instanceof Error ? err.message : String(err)
function parseId(val: unknown) {
  if (typeof val === 'string' && val.trim())
    return val.trim()
  throw new TypeError('定时任务的 id 不能为空')
}
const refId = (ref: JsonSchedulerJobRef) => parseId(typeof ref === 'string' ? ref : ref.id)

function parseCron(val: unknown, id: string): string {
  const cron = typeof val === 'string' ? val.trim() : ''
  if (!cron)
    throw new TypeError(`定时任务 "${id}" 的 cron 不能为空`)
  try {
    new Cron(cron, { paused: true }).stop()
  }
  catch (e) {
    throw new Error(`定时任务 "${id}" 的 cron 表达式无效：${cron}`, { cause: e })
  }
  return cron
}

function pickExtra(input: Record<string, unknown>): Record<string, JsonValue> {
  const extra: Record<string, JsonValue> = {}
  for (const [k, v] of Object.entries(input)) {
    if (v !== undefined && !RESERVED_KEYS.has(k))
      extra[k] = v as JsonValue
  }
  return extra
}

class JsonSchedulerImpl implements JsonScheduler {
  readonly filePath: string
  private options: JsonSchedulerOptions
  private records = new Map<string, JobRecord>()
  private hydration: Promise<void>
  private pending: Promise<void> = Promise.resolve()
  private saveError: unknown
  private disposed = false

  constructor(filePath: string, options: JsonSchedulerOptions = {}) {
    this.filePath = resolve(filePath)
    this.options = options
    this.hydration = this.load().catch(() => {})
  }

  ready = () => this.hydration

  use(input: JsonSchedulerJobInput, handler: JsonSchedulerHandler): () => boolean {
    if (typeof handler !== 'function')
      throw new TypeError('use() 的第二个参数必须是函数')
    const id = parseId(input.id)
    const cron = parseCron(input.cron, id)
    const extra = pickExtra(input)
    let record = this.records.get(id)

    if (record) {
      if (record.cronSource === 'use')
        record.cron = cron
      record.handler = handler
      Object.assign(record.extra, extra)
      record.updatedAt = nowIso()
    }
    else {
      const time = nowIso()
      record = {
        id,
        cron,
        status: 'running',
        cronSource: 'use',
        createdAt: time,
        updatedAt: time,
        lastRunAt: null,
        lastError: null,
        runCount: 0,
        extra,
        handler,
      }
      this.records.set(id, record)
    }
    this.arm(record)
    this.queueSave()
    return () => this.remove(id)
  }

  update(patch: JsonSchedulerJobPatch): boolean {
    const record = this.records.get(parseId(patch.id))
    if (!record)
      return false

    if (patch.cron !== undefined) {
      record.cron = parseCron(patch.cron, record.id)
      record.cronSource = 'update'
    }
    Object.assign(record.extra, pickExtra(patch))
    record.updatedAt = nowIso()
    if (patch.cron !== undefined)
      this.arm(record)
    this.queueSave()
    return true
  }

  remove(ref: JsonSchedulerJobRef): boolean {
    const record = this.records.get(refId(ref))
    if (!record)
      return false
    this.disarm(record)
    this.records.delete(record.id)
    this.queueSave()
    return true
  }

  async trigger(ref: JsonSchedulerJobRef): Promise<void> {
    const record = this.records.get(refId(ref))
    if (!record)
      throw new Error(`定时任务 "${refId(ref)}" 不存在`)
    if (!record.handler)
      throw new Error(`定时任务 "${record.id}" 还没有绑定回调`)
    await this.run(record, 'manual')
  }

  stop(ref: JsonSchedulerJobRef): boolean { return this.setStatus(refId(ref), 'paused') }
  start(ref: JsonSchedulerJobRef): boolean { return this.setStatus(refId(ref), 'running') }

  stopAll(): void { this.setAllStatus('paused') }
  startAll(): void { this.setAllStatus('running') }

  jobs(): JsonSchedulerJob[] {
    return [...this.records.values()].map(r => ({
      ...r.extra,
      id: r.id,
      cron: r.cron,
      status: r.status,
      hasHandler: Boolean(r.handler),
      nextRunAt: r.status === 'running' ? (r.job?.nextRun()?.toISOString() ?? null) : null,
      lastRunAt: r.lastRunAt,
      lastError: r.lastError,
      runCount: r.runCount,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }))
  }

  async flush(): Promise<void> {
    await this.pending
    const err = this.saveError
    if (err !== undefined) {
      this.saveError = undefined
      throw err
    }
  }

  async dispose(): Promise<void> {
    this.disposed = true
    for (const r of this.records.values()) this.disarm(r)
    await this.pending
  }

  private setStatus(id: string, status: JsonSchedulerStatus): boolean {
    const record = this.records.get(id)
    if (!record || record.status === status)
      return Boolean(record)
    record.status = status
    record.updatedAt = nowIso()
    status === 'paused' ? this.disarm(record) : this.arm(record)
    this.queueSave()
    return true
  }

  private setAllStatus(status: JsonSchedulerStatus): void {
    let changed = false
    for (const record of this.records.values()) {
      if (record.status !== status) {
        record.status = status
        record.updatedAt = nowIso()
        status === 'paused' ? this.disarm(record) : this.arm(record)
        changed = true
      }
    }
    if (changed)
      this.queueSave()
  }

  private arm(record: JobRecord): void {
    this.disarm(record)
    if (this.disposed || !record.handler || record.status === 'paused')
      return
    try {
      record.job = new Cron(record.cron, {
        protect: this.options.protect ?? true,
        unref: this.options.unref ?? false,
        timezone: this.options.timezone,
        catch: true,
      }, () => this.run(record, 'schedule'))
    }
    catch (e) {
      record.lastError = messageOf(e)
      this.report(e, { phase: 'run', id: record.id })
    }
  }

  private disarm(record: JobRecord): void {
    record.job?.stop()
    record.job = undefined
  }

  private async run(record: JobRecord, reason: JsonSchedulerRunReason): Promise<void> {
    const startedAt = new Date()
    record.lastRunAt = startedAt.toISOString()
    try {
      await record.handler!({
        id: record.id,
        cron: record.cron,
        reason,
        startedAt,
        job: this.jobs().find(j => j.id === record.id)!,
      })
      record.lastError = null
    }
    catch (e) {
      record.lastError = messageOf(e)
      if (reason === 'manual')
        throw e
      this.report(e, { phase: 'run', id: record.id })
    }
    finally {
      record.runCount++
    }
  }

  private report(error: unknown, context: JsonSchedulerErrorContext): void {
    if (this.options.onError) {
      try {
        this.options.onError(error, context)
      }
      catch {}
      return
    }
    console.error(`[json-scheduler] ${context.phase} 失败${context.id ? `（${context.id}）` : ''}:`, error)
  }

  private queueSave(): void {
    this.pending = this.pending
      .then(() => this.write())
      .then(() => { this.saveError = undefined })
      .catch((e) => {
        this.saveError = e
        this.report(e, { phase: 'save' })
      })
  }

  private async write(): Promise<void> {
    const payload = {
      version: 1,
      updatedAt: nowIso(),
      jobs: [...this.records.values()].map(r => ({
        ...r.extra,
        id: r.id,
        cron: r.cron,
        status: r.status,
        cronSource: r.cronSource,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        lastRunAt: r.lastRunAt,
        lastError: r.lastError,
        runCount: r.runCount,
      })),
    }
    await mkdir(dirname(this.filePath), { recursive: true })
    const tmp = `${this.filePath}.${process.pid}.tmp`
    await writeFile(tmp, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
    await rename(tmp, this.filePath)
  }

  private async load(): Promise<void> {
    let raw: string
    try {
      raw = await readFile(this.filePath, 'utf8')
    }
    catch (e: any) {
      if (e?.code === 'ENOENT')
        return
      throw e
    }
    if (!raw.trim())
      return

    const parsed = JSON.parse(raw)
    const list = Array.isArray(parsed) ? parsed : (parsed?.jobs ?? [])

    for (const stored of list) {
      if (!stored || typeof stored !== 'object')
        continue
      const id = typeof stored.id === 'string' ? stored.id.trim() : ''
      const cron = typeof stored.cron === 'string' ? stored.cron.trim() : ''
      if (!id || !cron)
        continue

      const status = stored.status === 'paused' ? 'paused' : 'running'
      const cronSource = stored.cronSource === 'update' ? 'update' : 'use'
      const extra = pickExtra(stored)
      let existing = this.records.get(id)

      if (!existing) {
        const time = typeof stored.createdAt === 'string' ? stored.createdAt : nowIso()
        existing = {
          id,
          cron,
          status,
          cronSource,
          createdAt: time,
          updatedAt: typeof stored.updatedAt === 'string' ? stored.updatedAt : time,
          lastRunAt: stored.lastRunAt ?? null,
          lastError: stored.lastError ?? null,
          runCount: stored.runCount ?? 0,
          extra,
        }
        this.records.set(id, existing)
      }
      else {
        existing.status = status
        existing.cronSource = cronSource
        if (cronSource === 'update')
          existing.cron = cron
        Object.assign(existing.extra, { ...extra, ...existing.extra })
      }
    }

    for (const r of this.records.values()) {
      if (r.handler)
        this.arm(r)
    }
  }
}

export function defineJsonScheduler(filePath: string, options: JsonSchedulerOptions = {}): JsonScheduler {
  return new JsonSchedulerImpl(filePath, options)
}
