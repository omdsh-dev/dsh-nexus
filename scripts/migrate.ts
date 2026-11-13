/**
 * 用 Prisma 生成迁移，再把 `prisma/migrations` 搬成 `src/database/migrations.ts`。
 *
 * 一个 Prisma 迁移目录 = 一个键，值就是它 `migration.sql` 的全文，原样搬运。
 *
 * 用法：pnpm run prisma:migrate
 */
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { x } from 'tinyexec'

const REPO_ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const MIGRATIONS_DIR = join(REPO_ROOT, 'prisma/migrations')
const DATABASE_DIR = join(REPO_ROOT, 'prisma/database')
const OUTPUT = join(REPO_ROOT, 'src/database/migrations.ts')

/** 把 SQL 原文缩进 4 格，便于嵌进模板字符串。 */
function indent(sql: string): string {
  return sql
    .split('\n')
    .map(line => (line.trim() ? `    ${line}` : ''))
    .join('\n')
}

async function main(): Promise<void> {
  rmSync(DATABASE_DIR, { recursive: true, force: true })
  const migrated = await x('pnpm', ['exec', 'prisma', 'migrate', 'dev', '--name', process.argv[2] || ''], {
    nodeOptions: { cwd: REPO_ROOT, stdio: 'inherit' },
  })
  if (migrated.exitCode !== 0)
    throw new Error('prisma migrate dev 失败')

  const entries = readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort()
    .map((name) => {
      const sql = readFileSync(join(MIGRATIONS_DIR, name, 'migration.sql'), 'utf8').trim()
      if (sql.includes('`') || sql.includes('${'))
        throw new Error(`迁移 ${name} 含有模板字符串定界符，无法安全嵌入生成物`)
      return `  '${name}': \`\n${indent(sql)}\n  \`,`
    })

  writeFileSync(
    OUTPUT,
    `/**
 * 由 \`pnpm run prisma:migrate\` 从 \`prisma/migrations\` 搬运，不要手改。
 *
 * 一个键就是一个 Prisma 迁移目录，值是它 \`migration.sql\` 的全文。
 */
/* eslint-disable */

export const migrations: Record<string, string> = {
${entries.join('\n\n')}
}
`,
    'utf8',
  )
  console.log(`[prisma:migrate] ${entries.length} 个迁移 → ${OUTPUT}`)
}

main().catch((error: unknown) => {
  console.error('[prisma:migrate]', error)
  process.exitCode = 1
})
