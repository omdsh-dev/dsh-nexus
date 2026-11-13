import type { Kysely, Selectable } from 'kysely'
import type { DB } from '../types'
import { Model } from 'kysely-model'

/**
 * 渠道：事件从哪来，回复往哪发。
 *
 * `enabled` 是监听开关，关掉的渠道不会再产生触发 —— 源侧轮询前应当先查它，
 * 而不是让触发进来再丢弃。
 */
export class Channel extends Model<DB, 'channel'> {
  constructor(db: Kysely<DB>) {
    super(db, 'channel', 'id')
  }

  /** 监听中的渠道；轮询器只用这些。 */
  async findEnabled(): Promise<Selectable<DB['channel']>[]> {
    return this.db
      .selectFrom('channel')
      .selectAll()
      .where('enabled', '=', 1)
      .orderBy('id')
      .execute()
  }

  /** 切换监听开关。 */
  async setEnabled(id: string, enabled: boolean): Promise<void> {
    await this.db
      .updateTable('channel')
      .set({ enabled: enabled ? 1 : 0 })
      .where('id', '=', id)
      .execute()
  }
}
