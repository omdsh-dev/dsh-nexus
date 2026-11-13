import type { Kysely, Selectable } from 'kysely'
import type { DB, SupervisorStatus } from '../types'
import { Model } from 'kysely-model'

/**
 * 临时 Supervisor：一件工作跨了两个以上项目时，主编排临时拉起来的协调者。
 *
 * 行不删 —— 那几张工单还指着它说明自己当初为什么存在。
 */
export class Supervisor extends Model<DB, 'supervisor'> {
  constructor(db: Kysely<DB>) {
    super(db, 'supervisor', 'id')
  }

  /** 还在协调的 Supervisor；收工的不再出现在界面里。 */
  async listActive(): Promise<Selectable<DB['supervisor']>[]> {
    return this.db
      .selectFrom('supervisor')
      .selectAll()
      .where('status', '=', 'active')
      .orderBy('createdAt')
      .execute()
  }

  /** 按状态列历史。 */
  async listByStatus(status: SupervisorStatus): Promise<Selectable<DB['supervisor']>[]> {
    return this.db
      .selectFrom('supervisor')
      .selectAll()
      .where('status', '=', status)
      .orderBy('createdAt')
      .execute()
  }

  /** 记下它的 DSH 会话；还没起会话时为空。 */
  async attachSession(id: string, sessionId: string | null): Promise<void> {
    await this.db
      .updateTable('supervisor')
      .set({ sessionId })
      .where('id', '=', id)
      .execute()
  }

  /** 收工：关联工单全部落地后调用；只写关闭时间，不删行。 */
  async close(id: string, closedAt: string): Promise<void> {
    await this.db
      .updateTable('supervisor')
      .set({ status: 'closed', closedAt })
      .where('id', '=', id)
      .execute()
  }
}
