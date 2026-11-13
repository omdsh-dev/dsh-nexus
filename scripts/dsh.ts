/**
 * 起一个专门用于开发的 DSH 实例：用独立 profile，把本仓当插件装进去。
 *
 * 为什么不用 desktop profile：它被 Electron 独占（`dsh --profile desktop` 直接报错），
 * 而且改坏了会影响正在用的 GUI。
 *
 * 热更新靠两层，profile 里两行都是开着的：
 *   - `hmr`（`@deepseek-ai/dsh-hmr`）：已链接包的构建产物一变，Host 插件就被换掉，不用重启；
 *   - `client-hmr`（`@deepseek-ai/dsh-client-hmr`）：Client 模块热替换，页面不用刷新。
 * 但这两层都只认**磁盘上已经变化的产物**，所以这里必须先开 watch 重建，否则改了源码
 * `dist/` 不动，什么都不会热。
 *
 * 用法：
 *   pnpm run dev:dsh            # 构建一次 + 持续 watch，然后起实例
 *   pnpm run dev:dsh --once     # 只构建一次，不 watch
 *   pnpm run dev:dsh --no-open  # 不自动开浏览器
 *
 * 环境变量：
 *   DSH_DEV_PROFILE   profile 名，默认 nexus-dev
 *   DSH_DEV_PORT      端口，默认 3091
 */
import type { ChildProcess } from 'node:child_process'
import type { Output } from 'tinyexec'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { x } from 'tinyexec'

const REPO_ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const PROFILE = process.env.DSH_DEV_PROFILE ?? 'nexus-dev'
const PORT = process.env.DSH_DEV_PORT ?? '3091'
const OPEN_BROWSER = !process.argv.includes('--no-open')
const WATCH = !process.argv.includes('--once')

interface PackageJson {
  name?: string
}

function readJson<T>(path: string): T | undefined {
  if (!existsSync(path))
    return undefined
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T
  }
  catch {
    return undefined
  }
}

const pkg = readJson<PackageJson>(join(REPO_ROOT, 'package.json'))
if (!pkg?.name)
  throw new Error(`package.json has no name: ${join(REPO_ROOT, 'package.json')}`)
const PACKAGE_NAME = pkg.name

const profileDir = join(process.env.DSH_HOME ?? join(homedir(), '.dsh'), 'profiles', PROFILE)
const linkSpec = `link:${REPO_ROOT.replace(/\\/gu, '/')}`

/** 跑一条命令并把输出直接透到当前终端；非零退出即失败。 */
async function run(command: string, args: string[]): Promise<void> {
  const result: Output = await x(command, args, {
    // inherit 而不是 pipe：沙箱下管道 stdio 会被拒绝，而且这里本来就要人看得到输出
    nodeOptions: { cwd: REPO_ROOT, stdio: 'inherit' },
  })
  if (result.exitCode !== 0)
    throw new Error(`\`${command} ${args.join(' ')}\` exited ${result.exitCode}`)
}

/** profile 不存在时从 shipped 的 web 模板建一个。`--dump-config` 让它建完即退，不起服务。 */
async function ensureProfile(): Promise<void> {
  if (existsSync(join(profileDir, 'package.json')))
    return
  console.log(`[dev:dsh] creating profile "${PROFILE}" from the shipped web template`)
  await run('dsh', [PROFILE, '--from-default-profile', 'web', '--dump-config'])
  if (!existsSync(join(profileDir, 'package.json')))
    throw new Error(`profile "${PROFILE}" was not created at ${profileDir}`)
}

/**
 * 让 profile 用 `link:` 指向本仓。
 *
 * link 而不是打包安装：`pnpm run dev` 重建的 `dist/` 立刻就在 profile 的 node_modules 里，
 * 不用每次改完都重新 pack + install。
 */
async function ensureLinked(): Promise<void> {
  const manifest = readJson<{ dependencies?: Record<string, string> }>(join(profileDir, 'package.json'))
  const current = manifest?.dependencies?.[PACKAGE_NAME]
  if (current === linkSpec)
    return
  console.log(`[dev:dsh] linking ${PACKAGE_NAME} -> ${REPO_ROOT}`)
  await run('dsh', ['plugin', '--profile', PROFILE, 'add', '--ignore-scripts', linkSpec])
}

function buildArgs(): string[] {
  const args = ['--profile', PROFILE, '--port', PORT]
  if (!OPEN_BROWSER)
    args.push('--no-open')
  return args
}

const children: ChildProcess[] = []

function stopChildren(): void {
  for (const child of children) {
    if (child.exitCode === null && child.pid !== undefined) {
      try {
        process.kill(child.pid)
      }
      catch {}
    }
  }
}

async function main(): Promise<void> {
  await ensureProfile()
  await ensureLinked()

  // 先完整构建一次：watch 的首轮产物要等它自己编译，实例不该在空 dist 上启动。
  await run('pnpm', ['run', 'build'])

  if (WATCH) {
    // tsdown --watch 之后每次源码变动都会重写 dist/，由 DSH 的 hmr / client-hmr 接手。
    const watcher = x('pnpm', ['run', 'dev'], {
      nodeOptions: { cwd: REPO_ROOT, stdio: 'inherit' },
      persist: true,
    })
    if (watcher.process)
      children.push(watcher.process)
    console.log('[dev:dsh] watching sources; Host 与 Client 都由 DSH 热替换')
  }

  console.log(`[dev:dsh] booting profile "${PROFILE}" on http://127.0.0.1:${PORT}`)
  await run('dsh', buildArgs())
}

process.on('SIGINT', () => {
  stopChildren()
  process.exit(0)
})

process.on('SIGTERM', () => {
  stopChildren()
  process.exit(0)
})

try {
  await main()
}
finally {
  stopChildren()
}
