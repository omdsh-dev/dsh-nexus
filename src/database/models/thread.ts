import type { Kysely, Selectable } from 'kysely'
import type { DB } from '../types'
import { Model } from 'kysely-model'

/**
 * 话题：一个 Issue、一个 PR、一个分支的 CI、或飞书里的一个话题串。
 *
 * `id` 是 `${channelId}:${refId}`，由来源事实派生，重复事件得到同一行。
 * 它是触发的容器，也是「这件事谈过什么」的最小单位。
 */
export class Thread extends Model<DB, 'thread'> {
  constructor(db: Kysely<DB>) {
    super(db, 'thread', 'id')
  }

  /** 按渠道侧的原始标识查；`(channelId, refId)` 唯一。 */
  async findByRef(channelId: string, refId: string): Promise<Selectable<DB['thread']> | undefined> {
    return this.db
      .selectFrom('thread')
      .selectAll()
      .where('channelId', '=', channelId)
      .where('refId', '=', refId)
      .executeTakeFirst()
  }

  /** 列表用：按本话题最新一条触发的时间倒序。 */
  async listRecent(limit = 50): Promise<Selectable<DB['thread']>[]> {
    return this.db
      .selectFrom('thread')
      .selectAll()
      .orderBy('updatedAt', 'desc')
      .limit(limit)
      .execute()
  }

  /** 新触发到达时推进 `updatedAt`，让话题冒到列表前面。 */
  async touch(id: string, updatedAt: string): Promise<void> {
    await this.db
      .updateTable('thread')
      .set({ updatedAt })
      .where('id', '=', id)
      .execute()
  }

  /**
   * 分诊：指派给某个项目。
   *
   * 只写一次，之后一直有效 —— 已认领的话题不会再反复叫醒主编排。
   */
  async claim(id: string, projectId: string, triagedAt: string): Promise<void> {
    await this.db
      .updateTable('thread')
      .set({ projectId, triage: 'claimed', triagedAt })
      .where('id', '=', id)
      .execute()
  }

  /** 分诊：判定无需处理；之后的触发不投递，除非又有人 @ 我们。 */
  async ignore(id: string, triagedAt: string): Promise<void> {
    await this.db
      .updateTable('thread')
      .set({ triage: 'ignored', triagedAt })
      .where('id', '=', id)
      .execute()
  }
}
