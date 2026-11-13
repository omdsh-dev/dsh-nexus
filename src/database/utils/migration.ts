import type { Migration, MigrationProvider as MigrationProviderContract } from 'kysely/migration'
import type { DatabaseSync } from 'node:sqlite'

/**
 * 把 SQL 文本包成 Kysely 迁移。
 *
 * 两个坑都在这里绕开：
 * 1. Kysely 的 SQLite 适配器用 `prepare()` 执行，多语句**不报错、只跑第一条**，
 *    所以改用 `DatabaseSync.exec()`，让 SQLite 自己解析整段脚本。
 * 2. 适配器的 `supportsTransactionalDdl` 为 false，迁移不会被自动包进事务，
 *    所以这里手动 BEGIN/COMMIT，一个迁移文件要么整篇生效、要么整篇回滚。
 *
 * 没有用 `kysely-migrate-sql`：它 0.2.0 从 `kysely` 根导入 `Migrator`，
 * 而 Kysely 0.29 起该导出只在 `kysely/migration`，模块加载即抛
 * `SyntaxError: does not provide an export named 'Migrator'`。
 */
export class MigrationProvider implements MigrationProviderContract {
  private readonly database: DatabaseSync
  private readonly migrations: Record<string, string>

  /**
   * @param database - 执行迁移的连接；必须与实际使用的同一个实例。
   * @param migrations - 迁移名到 SQL 全文的映射，按名字排序执行。
   */
  constructor(database: DatabaseSync, migrations: Record<string, string>) {
    this.database = database
    this.migrations = migrations
  }

  async getMigrations(): Promise<Record<string, Migration>> {
    return Object.fromEntries(
      Object.entries(this.migrations).map(([name, sql]) => [
        name,
        {
          up: async (): Promise<void> => {
            this.database.exec('BEGIN')
            try {
              this.database.exec(sql)
              this.database.exec('COMMIT')
            }
            catch (error) {
              this.database.exec('ROLLBACK')
              throw error
            }
          },
        },
      ]),
    )
  }
}
