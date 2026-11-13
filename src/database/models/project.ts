import type { Kysely, Selectable } from 'kysely'
import type { DB } from '../types'
import { Model } from 'kysely-model'

/** 一个项目 = 一个 git 仓库 + 一个 DSH 工作区。 */
export class Project extends Model<DB, 'project'> {
  constructor(db: Kysely<DB>) {
    super(db, 'project', 'id')
  }

  /** 一个工作区最多属于一个项目，所以这里至多一条。 */
  async findByWorkspace(workspaceId: string): Promise<Selectable<DB['project']> | undefined> {
    return this.db
      .selectFrom('project')
      .selectAll()
      .where('workspaceId', '=', workspaceId)
      .executeTakeFirst()
  }

  /** 仓库在渠道内唯一，例如 `hairyf/dsh-third-kernel`。 */
  async findByRepo(channelId: string, name: string): Promise<Selectable<DB['project']> | undefined> {
    return this.db
      .selectFrom('project')
      .selectAll()
      .where('channelId', '=', channelId)
      .where('name', '=', name)
      .executeTakeFirst()
  }

  /** 某渠道下的全部项目。 */
  async listByChannel(channelId: string): Promise<Selectable<DB['project']>[]> {
    return this.db
      .selectFrom('project')
      .selectAll()
      .where('channelId', '=', channelId)
      .orderBy('name')
      .execute()
  }

  /** 记下项目编排会话；只保留最近一次，换会话就覆盖。 */
  async setOrchestrator(id: string, orchestratorSessionId: string | null, updatedAt: string): Promise<void> {
    await this.db
      .updateTable('project')
      .set({ orchestratorSessionId, updatedAt })
      .where('id', '=', id)
      .execute()
  }
}
