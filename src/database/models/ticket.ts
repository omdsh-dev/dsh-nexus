import type { Kysely, Selectable, Updateable } from 'kysely'
import type { CiState, DB, PullRequestState, TicketStatus } from '../types'
import { Model } from 'kysely-model'

/** 已结束的状态；「开着」的任务指不在其中的那些。 */
const CLOSED_STATUS: readonly TicketStatus[] = ['done', 'cancelled']

/** 一个任务：主编排分诊出来的一件具体工作，最终落在某个项目里执行。 */
export class Ticket extends Model<DB, 'ticket'> {
  constructor(db: Kysely<DB>) {
    super(db, 'ticket', 'id')
  }

  /** 某项目下的任务，可按状态过滤。 */
  async listByProject(projectId: string, status?: TicketStatus): Promise<Selectable<DB['ticket']>[]> {
    const query = this.db
      .selectFrom('ticket')
      .selectAll()
      .where('projectId', '=', projectId)
    const scoped = status ? query.where('status', '=', status) : query
    return scoped.orderBy('updatedAt', 'desc').execute()
  }

  /** 还没结束的任务（waiting / queued / running / review）。 */
  async listOpen(): Promise<Selectable<DB['ticket']>[]> {
    return this.db
      .selectFrom('ticket')
      .selectAll()
      .where('status', 'not in', [...CLOSED_STATUS])
      .orderBy('updatedAt', 'desc')
      .execute()
  }

  /** 占着并发槽位的任务数；`running` 才算占用。 */
  async countRunning(): Promise<number> {
    const row = await this.db
      .selectFrom('ticket')
      .select(this.db.fn.countAll<number>().as('count'))
      .where('status', '=', 'running')
      .executeTakeFirst()
    return Number(row?.count ?? 0)
  }

  /**
   * 可以派发的任务：等待触发或排队中，且没被暂停。
   *
   * 暂停只挡派发、建 Worker、投递和出口，不打断正在跑的回合。
   */
  async listDispatchable(): Promise<Selectable<DB['ticket']>[]> {
    return this.db
      .selectFrom('ticket')
      .selectAll()
      .where('status', 'in', ['waiting', 'queued'])
      .where('paused', '=', 0)
      .orderBy('createdAt')
      .execute()
  }

  /** 第一次真正开跑：置为运行中并记下开始时间。 */
  async start(id: string, startedAt: string, updatedAt: string): Promise<void> {
    await this.db
      .updateTable('ticket')
      .set({ status: 'running', startedAt, updatedAt })
      .where('id', '=', id)
      .execute()
  }

  /** 结束任务：终态与结束时间一起写。 */
  async finish(id: string, status: TicketStatus, endedAt: string, updatedAt: string): Promise<void> {
    await this.db
      .updateTable('ticket')
      .set({ status, endedAt, updatedAt })
      .where('id', '=', id)
      .execute()
  }

  /** 记录关联 PR 与 CI 的当前状态。 */
  async setPullRequest(id: string, prUrl: string | null, prState: PullRequestState | null, ciState: CiState | null): Promise<void> {
    await this.db
      .updateTable('ticket')
      .set({ prUrl, prState, ciState })
      .where('id', '=', id)
      .execute()
  }

  /** 切换暂停开关。 */
  async setPaused(id: string, paused: boolean, updatedAt: string): Promise<void> {
    await this.db
      .updateTable('ticket')
      .set({ paused: paused ? 1 : 0, updatedAt })
      .where('id', '=', id)
      .execute()
  }

  /** 记录准备阶段（建 worktree 等）的失败原因；成功后清空。 */
  async setPrepareError(id: string, prepareError: string | null, updatedAt: string): Promise<void> {
    await this.db
      .updateTable('ticket')
      .set({ prepareError, updatedAt })
      .where('id', '=', id)
      .execute()
  }

  /** 通用部分更新；调用方负责写 `updatedAt`。 */
  async save(id: string, patch: Updateable<DB['ticket']>): Promise<void> {
    await this.db
      .updateTable('ticket')
      .set(patch)
      .where('id', '=', id)
      .execute()
  }
}
