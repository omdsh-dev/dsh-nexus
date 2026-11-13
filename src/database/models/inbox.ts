import type { Kysely, Selectable } from 'kysely'
import type { DB, InboxAnsweredBy, InboxTarget } from '../types'
import { Model } from 'kysely-model'

/**
 * 收件箱：一条投给某个代理、或者人类的消息。
 *
 * 代理在跑的时候消息不打断它，先落进队列；代理自己取、自己标记处理完。
 * 升级不新建行，就地改 `type` —— 一个问题从头到尾只有一个身份。
 */
export class Inbox extends Model<DB, 'inbox'> {
  constructor(db: Kysely<DB>) {
    super(db, 'inbox', 'id')
  }

  /**
   * 下一个入队序号。
   *
   * 同一票对同一地址按 `seq` 顺序发：前一条没成功，后一条等着，
   * 避免「结果」比「确认」先到。
   */
  async nextSeq(): Promise<number> {
    const row = await this.db
      .selectFrom('inbox')
      .select(this.db.fn.max('seq').as('max'))
      .executeTakeFirst()
    return Number(row?.max ?? 0) + 1
  }

  /** 某个收件人的未读消息；`projectId` 省略表示该类型下全部范围。 */
  async listPending(type: InboxTarget, projectId?: string | null): Promise<Selectable<DB['inbox']>[]> {
    const query = this.db
      .selectFrom('inbox')
      .selectAll()
      .where('type', '=', type)
      .where('status', '=', 'pending')
    const scoped = projectId === undefined ? query : query.where('projectId', '=', projectId)
    return scoped.orderBy('seq').execute()
  }

  /**
   * 「你有 N 条消息未处理」的计数。
   *
   * 只有 `pending` 进这个数；`stalled` 是送不到，不算未读。
   */
  async countPending(type: InboxTarget, projectId?: string | null): Promise<number> {
    const query = this.db
      .selectFrom('inbox')
      .select(this.db.fn.countAll<number>().as('count'))
      .where('type', '=', type)
      .where('status', '=', 'pending')
    const scoped = projectId === undefined ? query : query.where('projectId', '=', projectId)
    const row = await scoped.executeTakeFirst()
    return Number(row?.count ?? 0)
  }

  /** 人类欠着的问题；面板用 `createdAt` 排。 */
  async listPendingAsk(): Promise<Selectable<DB['inbox']>[]> {
    return this.db
      .selectFrom('inbox')
      .selectAll()
      .where('type', '=', 'user')
      .where('kind', '=', 'ask')
      .where('status', '=', 'pending')
      .orderBy('createdAt')
      .execute()
  }

  /** 标为已读：取进了上下文，但还没处理完。 */
  async markRead(ids: string[], readAt: string): Promise<void> {
    if (ids.length === 0)
      return
    await this.db
      .updateTable('inbox')
      .set({ readAt })
      .where('id', 'in', ids)
      .execute()
  }

  /** 标记处理完。 */
  async markDone(id: string, doneAt: string): Promise<void> {
    await this.db
      .updateTable('inbox')
      .set({ status: 'done', doneAt })
      .where('id', '=', id)
      .execute()
  }

  /** 回答问题：填上答案即视为处理完，答案顺着 `workerId` 送回发起方。 */
  async answer(id: string, answer: string, answeredBy: InboxAnsweredBy, answeredAt: string): Promise<void> {
    await this.db
      .updateTable('inbox')
      .set({ answer, answeredBy, answeredAt, status: 'done', doneAt: answeredAt })
      .where('id', '=', id)
      .execute()
  }

  /** 投递失败：累加尝试次数，记下原因并安排下次重试。 */
  async recordDeliveryFailure(id: string, deliveryError: string, nextRetryAt: string): Promise<void> {
    await this.db
      .updateTable('inbox')
      .set(eb => ({ deliveryAttempts: eb('deliveryAttempts', '+', 1), deliveryError, nextRetryAt }))
      .where('id', '=', id)
      .execute()
  }

  /** 投递成功：清零尝试次数与错误，取消重试。 */
  async resetDelivery(id: string): Promise<void> {
    await this.db
      .updateTable('inbox')
      .set({ deliveryAttempts: 0, deliveryError: null, nextRetryAt: null })
      .where('id', '=', id)
      .execute()
  }

  /** 连续重试失败，转 `stalled` 等人看；不是「没轮到」，是「送不到」。 */
  async markStalled(id: string, deliveryError: string): Promise<void> {
    await this.db
      .updateTable('inbox')
      .set({ status: 'stalled', deliveryError, nextRetryAt: null })
      .where('id', '=', id)
      .execute()
  }

  /** 到点该重试的投递。 */
  async listRetryable(now: string): Promise<Selectable<DB['inbox']>[]> {
    return this.db
      .selectFrom('inbox')
      .selectAll()
      .where('status', '=', 'pending')
      .where('nextRetryAt', 'is not', null)
      .where('nextRetryAt', '<=', now)
      .orderBy('nextRetryAt')
      .execute()
  }

  /**
   * 升级：递一层，`escalations` 加一。
   *
   * ask 没有超时 —— 它只往上问，问到谁谁就得答，提问方那条工作线停着。
   */
  async escalate(id: string, lastEscalatedAt: string): Promise<void> {
    await this.db
      .updateTable('inbox')
      .set(eb => ({ escalations: eb('escalations', '+', 1), lastEscalatedAt }))
      .where('id', '=', id)
      .execute()
  }

  /** 改投给另一个收件人；升级不新建行。 */
  async reassign(id: string, type: InboxTarget, refs: { projectId?: string | null, supervisorId?: string | null } = {}): Promise<void> {
    await this.db
      .updateTable('inbox')
      .set({ type, ...refs })
      .where('id', '=', id)
      .execute()
  }
}
