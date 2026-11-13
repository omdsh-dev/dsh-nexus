import type { Kysely, Selectable } from 'kysely'
import type { DB, TicketLinkKind } from '../types'

/**
 * 任务 ↔ 任务：方向永远是 `ticketId` 指向 `relatedId`。
 *
 * 主键是 `(ticketId, relatedId, kind)`；`depends` 会触发一条自动通知，
 * 所以「谁在等我」的查询要按 `relatedId` 走。
 */
export class TicketLink {
  private readonly db: Kysely<DB>

  constructor(db: Kysely<DB>) {
    this.db = db
  }

  /** 这张任务指向别人的关联（它依赖谁、和谁相关）。 */
  async listByTicket(ticketId: string): Promise<Selectable<DB['ticket_link']>[]> {
    return this.db
      .selectFrom('ticket_link')
      .selectAll()
      .where('ticketId', '=', ticketId)
      .orderBy('kind')
      .orderBy('relatedId')
      .execute()
  }

  /** 指向这张任务的关联（谁在等它、谁和它相关）；终态通知用它找下游。 */
  async listByRelated(relatedId: string): Promise<Selectable<DB['ticket_link']>[]> {
    return this.db
      .selectFrom('ticket_link')
      .selectAll()
      .where('relatedId', '=', relatedId)
      .orderBy('kind')
      .orderBy('ticketId')
      .execute()
  }

  /** 前置依赖：这些任务没做完，当前任务就停在等待触发。 */
  async listDependsOn(ticketId: string): Promise<Selectable<DB['ticket_link']>[]> {
    return this.db
      .selectFrom('ticket_link')
      .selectAll()
      .where('ticketId', '=', ticketId)
      .where('kind', '=', 'depends')
      .execute()
  }

  /** 建立关联；重复关联保持原样。 */
  async link(ticketId: string, relatedId: string, kind: TicketLinkKind, createdAt: string): Promise<void> {
    await this.db
      .insertInto('ticket_link')
      .values({ ticketId, relatedId, kind, createdAt })
      .onConflict(oc => oc.columns(['ticketId', 'relatedId', 'kind']).doNothing())
      .execute()
  }

  /** 解除一条关联。 */
  async unlink(ticketId: string, relatedId: string, kind: TicketLinkKind): Promise<void> {
    await this.db
      .deleteFrom('ticket_link')
      .where('ticketId', '=', ticketId)
      .where('relatedId', '=', relatedId)
      .where('kind', '=', kind)
      .execute()
  }
}
