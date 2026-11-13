import type { Kysely, Selectable } from 'kysely'
import type { DB } from '../types'
import { Model } from 'kysely-model'

/**
 * CI 观察点：每个被观察目标一行，用来算「这次和上次比变了吗」。
 *
 * 没有这份记忆就比不出变化，CI 每次状态翻转都会刷满收件箱。
 */
export class CiWatch extends Model<DB, 'ci_watch'> {
  constructor(db: Kysely<DB>) {
    super(db, 'ci_watch', 'id')
  }

  /** 取一个观察点：`pull` 用 PR 号，`branch` 用分支名。 */
  async findTarget(channelId: string, kind: string, ref: string): Promise<Selectable<DB['ci_watch']> | undefined> {
    return this.db
      .selectFrom('ci_watch')
      .selectAll()
      .where('channelId', '=', channelId)
      .where('kind', '=', kind)
      .where('ref', '=', ref)
      .executeTakeFirst()
  }

  /** 某渠道下的全部观察点。 */
  async listByChannel(channelId: string): Promise<Selectable<DB['ci_watch']>[]> {
    return this.db
      .selectFrom('ci_watch')
      .selectAll()
      .where('channelId', '=', channelId)
      .orderBy('ref')
      .execute()
  }

  /**
   * 记下一份新指纹并把 revision 加一。
   *
   * revision 进触发 id，所以同一轮变化的重复轮询得到同一个 id，
   * 天然幂等；只在指纹真的变了时调用。
   */
  async rotate(id: string, fingerprint: string, updatedAt: string, head: string | null = null): Promise<void> {
    await this.db
      .updateTable('ci_watch')
      .set(eb => ({ fingerprint, head, updatedAt, revision: eb('revision', '+', 1) }))
      .where('id', '=', id)
      .execute()
  }
}
