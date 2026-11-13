import type { Kysely, Selectable } from 'kysely'
import type { DB, ReportState, WorkerEndReason } from '../types'
import { Model } from 'kysely-model'

/**
 * Worker（执行会话）：任务在某个 DSH 会话里真正干活的那一段。
 *
 * 一个任务可以先后有好几个（重试、换人）。`id` 就是 DSH 会话 id。
 */
export class Worker extends Model<DB, 'worker'> {
  constructor(db: Kysely<DB>) {
    super(db, 'worker', 'id')
  }

  /** 这张任务的所有会话，按创建时间排；详情页显示执行历史用。 */
  async listByTicket(ticketId: string): Promise<Selectable<DB['worker']>[]> {
    return this.db
      .selectFrom('worker')
      .selectAll()
      .where('ticketId', '=', ticketId)
      .orderBy('createdAt')
      .execute()
  }

  /** 正在跑的会话；槽位计数与实际占用以它为准。 */
  async listRunning(): Promise<Selectable<DB['worker']>[]> {
    return this.db
      .selectFrom('worker')
      .selectAll()
      .where('status', '=', 'running')
      .orderBy('startedAt')
      .execute()
  }

  /** 按 worktree 分支找正在跑的会话；PR 归哪张工单靠这个确定性比较。 */
  async findRunningByBranch(branch: string): Promise<Selectable<DB['worker']> | undefined> {
    return this.db
      .selectFrom('worker')
      .selectAll()
      .where('branch', '=', branch)
      .where('status', '=', 'running')
      .executeTakeFirst()
  }

  /** 会话真正开始跑：从 `queued` 进 `running`。 */
  async start(id: string, startedAt: string): Promise<void> {
    await this.db
      .updateTable('worker')
      .set({ status: 'running', startedAt })
      .where('id', '=', id)
      .execute()
  }

  /** 结束会话并记下原因；`endedReason` 为空表示还开着。 */
  async end(id: string, endedReason: WorkerEndReason, endedAt: string): Promise<void> {
    await this.db
      .updateTable('worker')
      .set({ status: 'ended', endedReason, endedAt })
      .where('id', '=', id)
      .execute()
  }

  /** 最近一次汇报：状态 + 一句话摘要，详情页直接显示。 */
  async setReport(id: string, reportState: ReportState, report: string, reportAt: string): Promise<void> {
    await this.db
      .updateTable('worker')
      .set({ reportState, report, reportAt })
      .where('id', '=', id)
      .execute()
  }

  /**
   * 后台工作还能跑到什么时候。
   *
   * 回合结束时如果还有后台在跑，票继续占着槽位；为空表示正常释放。
   */
  async setBackgroundUntil(id: string, backgroundUntil: string | null): Promise<void> {
    await this.db
      .updateTable('worker')
      .set({ backgroundUntil })
      .where('id', '=', id)
      .execute()
  }

  /** 重启后重开时写的一句话，避免重复做外部动作（重复开 PR、重复发评论）。 */
  async setRecoveryNote(id: string, recoveryNote: string | null): Promise<void> {
    await this.db
      .updateTable('worker')
      .set({ recoveryNote })
      .where('id', '=', id)
      .execute()
  }
}
