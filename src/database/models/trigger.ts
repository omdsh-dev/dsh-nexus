import type { Kysely, Selectable } from 'kysely'
import type { DB } from '../types'
import { Model } from 'kysely-model'

/**
 * 一条触发：渠道里发生的、不可变的一件事。
 *
 * `id` 由来源事实派生（例如 `github:hairyf/x:issue-1511:comment-42`），
 * 同一条消息重复推送得到同一行，天然幂等。
 */
export class Trigger extends Model<DB, 'trigger'> {
  constructor(db: Kysely<DB>) {
    super(db, 'trigger', 'id')
  }

  /** 话题上的触发时间线，最新的在前。 */
  async listByThread(threadId: string, limit = 50): Promise<Selectable<DB['trigger']>[]> {
    return this.db
      .selectFrom('trigger')
      .selectAll()
      .where('threadId', '=', threadId)
      .orderBy('at', 'desc')
      .orderBy('id', 'desc')
      .limit(limit)
      .execute()
  }

  /** 话题上最新一条触发；「被 @ 了才叫醒代理」的判定点。 */
  async lastByThread(threadId: string): Promise<Selectable<DB['trigger']> | undefined> {
    return this.db
      .selectFrom('trigger')
      .selectAll()
      .where('threadId', '=', threadId)
      .orderBy('at', 'desc')
      .orderBy('id', 'desc')
      .executeTakeFirst()
  }

  /** 某渠道某时刻之后的触发；增量补读用。 */
  async listByChannelSince(channelId: string, since: string): Promise<Selectable<DB['trigger']>[]> {
    return this.db
      .selectFrom('trigger')
      .selectAll()
      .where('channelId', '=', channelId)
      .where('at', '>', since)
      .orderBy('at')
      .execute()
  }

  /** 按 PR / 推送的 head 分支找触发，用来把 PR 归到对应工单上。 */
  async listByRef(channelId: string, ref: string): Promise<Selectable<DB['trigger']>[]> {
    return this.db
      .selectFrom('trigger')
      .selectAll()
      .where('channelId', '=', channelId)
      .where('ref', '=', ref)
      .orderBy('at', 'desc')
      .execute()
  }

  /** 这条触发是否已经入库；重复推送时用来跳过后续处理。 */
  async exists(id: string): Promise<boolean> {
    const row = await this.db
      .selectFrom('trigger')
      .select('id')
      .where('id', '=', id)
      .executeTakeFirst()
    return row !== undefined
  }
}
