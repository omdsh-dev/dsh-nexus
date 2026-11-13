import type { Kysely, Selectable } from 'kysely'
import type { DB } from '../types'

/**
 * 任务 ↔ 话题，也就是「订阅」。
 *
 * 任务订阅这些话题之后，话题上再来新触发就该冒到编排的收件箱里。
 * 主键是 `(ticketId, threadId)`，最先建立的那条就是该任务的触发来源。
 */
export class TicketThread {
  private readonly db: Kysely<DB>

  constructor(db: Kysely<DB>) {
    this.db = db
  }

  /** 这张任务订阅了哪些话题，按建立时间排（最早的是触发来源）。 */
  async listByTicket(ticketId: string): Promise<Selectable<DB['ticket_thread']>[]> {
    return this.db
      .selectFrom('ticket_thread')
      .selectAll()
      .where('ticketId', '=', ticketId)
      .orderBy('createdAt')
      .execute()
  }

  /** 这条话题下跟着哪些任务；路由先看订阅，没有订阅才看分诊结论。 */
  async listByThread(threadId: string): Promise<Selectable<DB['ticket_thread']>[]> {
    return this.db
      .selectFrom('ticket_thread')
      .selectAll()
      .where('threadId', '=', threadId)
      .orderBy('createdAt')
      .execute()
  }

  /** 这条话题的订阅任务 id；新触发投递前用它决定收件人。 */
  async listTicketIds(threadId: string): Promise<string[]> {
    const rows = await this.db
      .selectFrom('ticket_thread')
      .select('ticketId')
      .where('threadId', '=', threadId)
      .orderBy('createdAt')
      .execute()
    return rows.map(row => row.ticketId)
  }

  /** 订阅；重复订阅保持最早那条的 `createdAt`。 */
  async link(ticketId: string, threadId: string, createdAt: string): Promise<void> {
    await this.db
      .insertInto('ticket_thread')
      .values({ ticketId, threadId, createdAt })
      .onConflict(oc => oc.columns(['ticketId', 'threadId']).doNothing())
      .execute()
  }

  /** 取消订阅。 */
  async unlink(ticketId: string, threadId: string): Promise<void> {
    await this.db
      .deleteFrom('ticket_thread')
      .where('ticketId', '=', ticketId)
      .where('threadId', '=', threadId)
      .execute()
  }
}
