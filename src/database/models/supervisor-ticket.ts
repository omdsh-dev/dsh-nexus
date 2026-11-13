import type { Kysely, Selectable } from 'kysely'
import type { DB } from '../types'

/**
 * Supervisor ↔ 工单（通常每个项目一张）。
 *
 * 主键是 `(supervisorId, ticketId)`；「全部走到终态就该收工」直接查这张表，
 * 不存冗余字段。复合主键不套 `Model`，避免误用单值主键操作。
 */
export class SupervisorTicket {
  private readonly db: Kysely<DB>

  constructor(db: Kysely<DB>) {
    this.db = db
  }

  /** 这个 Supervisor 关联了哪些工单。 */
  async listBySupervisor(supervisorId: string): Promise<Selectable<DB['supervisor_ticket']>[]> {
    return this.db
      .selectFrom('supervisor_ticket')
      .selectAll()
      .where('supervisorId', '=', supervisorId)
      .orderBy('createdAt')
      .execute()
  }

  /** 这张工单被哪些 Supervisor 管着；`depends` 自动通知用它找收件人。 */
  async listByTicket(ticketId: string): Promise<Selectable<DB['supervisor_ticket']>[]> {
    return this.db
      .selectFrom('supervisor_ticket')
      .selectAll()
      .where('ticketId', '=', ticketId)
      .execute()
  }

  /** 建立关联；重复关联保持原有 `createdAt`。 */
  async link(supervisorId: string, ticketId: string, createdAt: string): Promise<void> {
    await this.db
      .insertInto('supervisor_ticket')
      .values({ supervisorId, ticketId, createdAt })
      .onConflict(oc => oc.columns(['supervisorId', 'ticketId']).doNothing())
      .execute()
  }

  /** 解除关联。 */
  async unlink(supervisorId: string, ticketId: string): Promise<void> {
    await this.db
      .deleteFrom('supervisor_ticket')
      .where('supervisorId', '=', supervisorId)
      .where('ticketId', '=', ticketId)
      .execute()
  }
}
