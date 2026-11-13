import type { Kysely, Selectable } from 'kysely'
import type { AccountRole, AccountStatus, DB } from '../types'
import { Model } from 'kysely-model'

/**
 * 渠道里的账号：`bot` 替我们说话，`admin` 是允许给我们派活的人。
 *
 * 准入判断只认 `admin` 名单，不从消息正文推断身份。
 */
export class ChannelAccount extends Model<DB, 'channel_account'> {
  constructor(db: Kysely<DB>) {
    super(db, 'channel_account', 'id')
  }

  /** 某渠道下的账号，按角色分组展示用。 */
  async findByChannel(channelId: string): Promise<Selectable<DB['channel_account']>[]> {
    return this.db
      .selectFrom('channel_account')
      .selectAll()
      .where('channelId', '=', channelId)
      .orderBy('role')
      .orderBy('name')
      .execute()
  }

  /** 某渠道下的某一类账号，例如所有机器人。 */
  async findByRole(channelId: string, role: AccountRole): Promise<Selectable<DB['channel_account']>[]> {
    return this.db
      .selectFrom('channel_account')
      .selectAll()
      .where('channelId', '=', channelId)
      .where('role', '=', role)
      .orderBy('name')
      .execute()
  }

  /** 按渠道侧名字查账号；准入名单判定用。 */
  async findByName(channelId: string, role: AccountRole, name: string): Promise<Selectable<DB['channel_account']> | undefined> {
    return this.db
      .selectFrom('channel_account')
      .selectAll()
      .where('channelId', '=', channelId)
      .where('role', '=', role)
      .where('name', '=', name)
      .executeTakeFirst()
  }

  /** 更新登录状态；掉线的渠道既产生不了触发，也发不出去。 */
  async setStatus(id: string, status: AccountStatus): Promise<void> {
    await this.db
      .updateTable('channel_account')
      .set({ status })
      .where('id', '=', id)
      .execute()
  }
}
