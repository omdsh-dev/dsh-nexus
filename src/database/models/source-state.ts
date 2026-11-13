import type { Kysely, Selectable } from 'kysely'
import type { DB } from '../types'

/**
 * 渠道读到哪了：每个需要增量读取的目标一行。
 *
 * 主键是 `(channelId, name)`，所以不套 `Model` —— 它的按主键操作
 * 只接受单个值，用在这里会误删同渠道的其它游标。
 */
export class SourceState {
  private readonly db: Kysely<DB>

  constructor(db: Kysely<DB>) {
    this.db = db
  }

  /** 读一个游标；没读过时为空。 */
  async find(channelId: string, name: string): Promise<Selectable<DB['source_state']> | undefined> {
    return this.db
      .selectFrom('source_state')
      .selectAll()
      .where('channelId', '=', channelId)
      .where('name', '=', name)
      .executeTakeFirst()
  }

  /** 某渠道的全部游标。 */
  async listByChannel(channelId: string): Promise<Selectable<DB['source_state']>[]> {
    return this.db
      .selectFrom('source_state')
      .selectAll()
      .where('channelId', '=', channelId)
      .orderBy('name')
      .execute()
  }

  /** 推进游标；不存在则插入。 */
  async set(channelId: string, name: string, value: string, updatedAt: string): Promise<void> {
    await this.db
      .insertInto('source_state')
      .values({ channelId, name, value, updatedAt })
      .onConflict(oc => oc.columns(['channelId', 'name']).doUpdateSet({ value, updatedAt }))
      .execute()
  }

  /** 删一个游标，例如话题已不再会被读取。 */
  async remove(channelId: string, name: string): Promise<void> {
    await this.db
      .deleteFrom('source_state')
      .where('channelId', '=', channelId)
      .where('name', '=', name)
      .execute()
  }
}
