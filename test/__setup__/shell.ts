import type { Page } from 'playwright'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { x } from 'tinyexec'
import { dshCommand, exchangeProcessLaunchToken, freePort, stop, trustedProcessLaunchUrl } from './shell.utils'

export const HAS_DSH = dshCommand()

const REPO_ROOT = fileURLToPath(new URL('../..', import.meta.url))
const PROFILE_ROOT = join(homedir(), '.dsh', 'profiles')

/**
 * E2E 用**独立 profile**，不复用开发者的 `web`。
 *
 * 这个 profile 第一次跑时从 `web` 模板建一次，里面用 `link:` 指向本仓；之后一直复用。
 * 所以第二次往后只剩「起一个 dsh」的开销：不 pack、不重新装包、也不去备份/还原别人的
 * profile —— 上一版每次跑都干这三件事，几分钟全耗在那里。
 *
 * 建不出来（老版本 dsh 没有 `--from-default-profile`）时只在 CI 回退到 `web`：
 * CI 是一次性 runner，污染无所谓；本地回退会写进开发者自己的 profile，所以直接报错。
 */
const PROFILE = process.env.DSH_E2E_PROFILE ?? 'nexus-e2e'

/** 本仓包名，用来判断 profile 里的链接是不是指向它。 */
function packageName(): string {
  return (JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8')) as { name: string }).name
}

const LINK_SPEC = `link:${REPO_ROOT.replace(/\\/gu, '/')}`

function profileManifestPath(profile: string): string {
  return join(PROFILE_ROOT, profile, 'package.json')
}

/**
 * 拿到一个可用的 profile 名：已有就直接用，没有就建一个。
 * @param command - dsh 可执行命令。
 * @returns 实际要启动的 profile 名。
 */
async function prepareProfile(command: string): Promise<string> {
  if (existsSync(profileManifestPath(PROFILE)))
    return PROFILE

  const created = await x(command, [PROFILE, '--from-default-profile', 'web', '--dump-config'], {
    timeout: 300_000,
    throwOnError: false,
    nodeOptions: { cwd: REPO_ROOT, env: shellEnv(), stdio: 'ignore', windowsHide: true },
  })

  if (created.exitCode === 0 && existsSync(profileManifestPath(PROFILE)))
    return PROFILE
  if (process.env.CI)
    return 'web'
  throw new Error(
    `无法创建 E2E profile "${PROFILE}"；请手动建一次，或用 DSH_E2E_PROFILE 指定一个已存在的 profile`,
  )
}

/**
 * 确保 profile 以 `link:` 指向本仓。
 * @param command - dsh 可执行命令。
 * @param profile - 目标 profile。
 */
async function ensureLinked(command: string, profile: string): Promise<void> {
  const manifest = JSON.parse(readFileSync(profileManifestPath(profile), 'utf8')) as {
    dependencies?: Record<string, string>
  }
  if (manifest.dependencies?.[packageName()] === LINK_SPEC)
    return

  await x(command, ['plugin', '--profile', profile, 'add', '--ignore-scripts', LINK_SPEC], {
    timeout: 300_000,
    throwOnError: true,
    nodeOptions: { cwd: REPO_ROOT, env: shellEnv(), stdio: 'inherit', windowsHide: true },
  })
}

/**
 * 子进程环境。
 *
 * **不要设 `DSH_HOME`。** 它对这个版本的 dsh 不生效（`plugin` 与启动都固定走 `~/.dsh`），
 * 副作用却是致命的：设了之后 dsh 不再往 stdout 打印 `dsh web: http://…/?token=…`，
 * 于是拿不到启动 token，换不到 `SameSite=Strict` 的 Cookie，浏览器只能停在鉴权页
 * —— 表现为「页面空白、零 console 错误」。隔离靠 profile，不靠这个环境变量。
 */
function shellEnv(): NodeJS.ProcessEnv {
  return { ...process.env, CI: 'true' }
}

export interface ShellScaffold {
  baseUrl: string
  processLaunchUrl: string
  home: string
  api: (path: string, init?: RequestInit) => Promise<Response>
  close: () => Promise<void>
}

/**
 * 端口就绪后等启动 URL 的时间。
 *
 * 这台机器上 dsh 从 spawn 到打印 `dsh web: …?token=…` 要十几秒（Profile 激活），
 * 早先只给 15s，首次跑正好卡在边界上，于是拿不到 token、报「untrusted URL」。
 * CI 上的老版本不打印这个 URL，会白等这段，所以别调太大。
 */
const LAUNCH_URL_GRACE_MS = Number(process.env.DSH_E2E_LAUNCH_URL_GRACE_MS ?? 60_000)

export async function openShellPage(page: Page, scaffold: Pick<ShellScaffold, 'baseUrl' | 'processLaunchUrl'>): Promise<void> {
  const exchange = await exchangeProcessLaunchToken(scaffold.baseUrl, scaffold.processLaunchUrl)
  if (exchange) {
    await page.context().addCookies([exchange.cookie])
  }
  await page.goto(scaffold.baseUrl, { waitUntil: 'load' })
}

export function logs(page: Page): { errors: () => string[] } {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const location = msg.location().url
      if (!msg.text().includes('401') && !msg.text().includes('Unauthorized'))
        errors.push(location ? `${msg.text()} (${location})` : msg.text())
    }
  })
  page.on('response', (response) => {
    if (response.status() >= 400 && response.status() !== 401)
      errors.push(`${response.status()} ${response.url()}`)
  })
  page.on('pageerror', err => errors.push(String(err)))
  return { errors: () => [...errors] }
}

export async function launchShell(): Promise<ShellScaffold> {
  const command = dshCommand()
  if (!command)
    throw new Error('no dsh available — set DSH_E2E_DSH or put dsh on PATH')

  const profile = await prepareProfile(command)
  await ensureLinked(command, profile)

  const port = await freePort()
  const baseUrl = `http://127.0.0.1:${port}`
  const cwd = process.env.DSH_E2E_DSH_CWD ?? REPO_ROOT
  /**
   * 不能用 `persist`，也不能传 `detached`。
   *
   * 两者都会让子进程脱离父控制台，Windows 上 stdout 直接丢光（实测 0 字节），
   * 于是读不到 `dsh web: …?token=…`，报「untrusted launch URL」。POSIX 上
   * 早先靠 detached 才收得到，实际是 Windows 特有的坑；统一用前台子进程，
   * 收尾时按 pid 杀整个进程树。
   */
  const processResult = x(command, ['--profile', profile, '--port', String(port), '--no-open'], {
    nodeOptions: {
      cwd,
      env: shellEnv(),
      stdio: ['ignore', 'pipe', 'pipe'],
      // .cmd 包装器会自己开一个控制台窗口，压掉。
      windowsHide: true,
    },
  })
  const child = processResult.process
  if (!child)
    throw new Error('failed to start dsh web process')

  let processLaunchUrl = ''
  let startupOutput = ''
  for (const stream of [child.stdout, child.stderr]) {
    stream?.on('data', (chunk: Uint8Array) => {
      startupOutput = (startupOutput + chunk.toString()).slice(-8192)
      for (const line of startupOutput.split(/\r?\n/u)) {
        const match = /^dsh web:\s+(https?:\/\/\S+)\s*$/u.exec(line)
        if (match && trustedProcessLaunchUrl(baseUrl, match[1]!) !== null)
          processLaunchUrl = match[1]!
      }
    })
  }

  try {
    const deadline = Date.now() + 120_000
    let statusReady = false
    let readyAt = 0
    for (; ;) {
      /**
       * 端口通了就算就绪，但**再给启动 URL 一点时间**。
       *
       * 这台机器上的 dsh 会打印 `dsh web: http://.../?token=...`；CI 上的版本可能不打印
       * （走不需要 token 的旧路径，`exchangeProcessLaunchToken` 里有对应分支）。
       * 所以不能死等 —— 等不到就按无 token 处理。
       */
      if (statusReady) {
        if (processLaunchUrl)
          break
        if (Date.now() - readyAt > LAUNCH_URL_GRACE_MS)
          break
      }
      if (child.exitCode !== null)
        throw new Error(`dsh exited ${child.exitCode}:\n${startupOutput.slice(-2000)}`)
      try {
        const response = await fetch(baseUrl, { signal: AbortSignal.timeout(2000) })
        if (!statusReady && (response.ok || response.status === 401))
          readyAt = Date.now()
        statusReady = response.ok || response.status === 401
      }
      catch {
        statusReady = false
      }
      if (Date.now() > deadline)
        throw new Error(`dsh boot timeout (status=${statusReady}, startup URL=${!processLaunchUrl ? 'missing' : 'ready'})`)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    const session = await exchangeProcessLaunchToken(baseUrl, processLaunchUrl)
    const cookieHeader = session ? `${session.cookie.name}=${session.cookie.value}` : undefined
    let closed = false

    return {
      baseUrl,
      processLaunchUrl,
      home: join(PROFILE_ROOT, profile),
      api: async (path: string, init: RequestInit = {}) => fetch(
        new URL(path, baseUrl).href,
        {
          ...init,
          headers: {
            ...init.headers,
            ...(cookieHeader ? { cookie: cookieHeader } : {}),
          },
          signal: init.signal ?? AbortSignal.timeout(30_000),
        },
      ),
      close: async () => {
        if (closed)
          return
        closed = true
        // profile 留着给下次复用，只停服务进程。
        await stop(child)
      },
    }
  }
  catch (error) {
    // 启动中途失败时自己收尸，否则 dsh 进程会吊着 vitest 不退出。
    await stop(child)
    throw error
  }
}
