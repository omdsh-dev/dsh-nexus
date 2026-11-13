import type { Kysely, Selectable, Updateable } from 'kysely'
import type { DB } from '../types'
import { Model } from 'kysely-model'

/** 设置表的固定主键：全局只有一行。 */
export const SETTING_ID = 'global' as const

/**
 * 全局设置。配置是「这套系统怎么跑」，属于部署；
 * 项目、渠道、任务上的运行期状态不进这里。
 */
export class Setting extends Model<DB, 'setting'> {
  constructor(db: Kysely<DB>) {
    super(db, 'setting', 'id')
  }

  /** 读全局设置；还没建过时为空。 */
  async load(): Promise<Selectable<DB['setting']> | undefined> {
    return this.db
      .selectFrom('setting')
      .selectAll()
      .where('id', '=', SETTING_ID)
      .executeTakeFirst()
  }

  /** 确保全局行存在（其余列走 schema 默认值），返回当前设置。 */
  async ensure(updatedAt: string): Promise<Selectable<DB['setting']>> {
    await this.db
      .insertInto('setting')
      .values({ id: SETTING_ID, updatedAt })
      .onConflict(oc => oc.column('id').doNothing())
      .execute()
    const row = await this.load()
    if (!row)
      throw new Error('setting 全局行插入后仍然读不到')
    return row
  }

  /** 部分更新；`updatedAt` 由调用方写入。 */
  async save(patch: Updateable<DB['setting']>): Promise<void> {
    await this.db
      .updateTable('setting')
      .set(patch)
      .where('id', '=', SETTING_ID)
      .execute()
  }
}
