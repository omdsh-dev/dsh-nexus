import { defineTool } from '@deepseek-ai/dsh-tools'

/**
 * 派票给项目编排。主编排和 Supervisor 都用这一份：
 * 两者都是「让某个项目编排就这张票做事」，写的也是同一条 Inbox。
 *
 * **不收 projectId。** 项目归属记在 `Ticket.projectId` 上，由 ticketId 推出 ——
 * 再传一次只会多一个能和库里的值对不上的参数。
 */
export const dispatch_ticket = defineTool({
  name: 'dispatch_ticket',
  description: '把票派给它的项目编排：写一条 Inbox(type=project, kind=ticket)。',
  parameters: {
    ticketId: {
      type: 'string',
      required: true,
      description: '要派下去的票。归属由票自己决定，不用另外传项目。',
    },
    message: {
      type: 'string',
      description: '附带给该项目编排的话。派新票时可省；只是提醒或调整时，写清楚要它做什么 —— 只说场景和约束，不要附实现方案。',
    },
  },
  output: {
    schema: { type: 'string', description: '派工结果。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 由 ticketId 读 Ticket.projectId，写 Inbox(type=project, kind=ticket, ticketId, message)
    // TODO: 票不存在时报错；已到终态也报错，不要投一条指向死票的消息
    // TODO: origin 记为调用方身份（main / supervisor），项目编排据此知道该找谁回话
    throw new Error('dispatch_ticket 尚未实现')
  },
})

/**
 * 给这张票的项目编排递一条信息：不派活、不改状态、不复活已终态的票。
 *
 * 和 `dispatch_ticket` 是一对：那个说「去干」，这个说「你知道就行」。
 * 少了它，一句通报也只能走 dispatch —— 而 dispatch 会唤醒已结束的票，
 * 一句「顺带说一下」就能把收工的活重新拉起来。
 *
 * 官方把它叫 `orchestrator_ticket_note`，原话是 "it grants no authority"。
 */
export const note_ticket = defineTool({
  name: 'note_ticket',
  description: '把在别处得到的事实告诉这张票的项目编排：只传信息，不给授权，不改任何状态。',
  parameters: {
    ticketId: {
      type: 'string',
      required: true,
      description: '要通知的票。消息进它所属项目编排的收件箱。',
    },
    text: {
      type: 'string',
      required: true,
      description: '要说的事实，一句话，例如「A 把接口改成了 Y」。只说发生了什么，不要写成任务要求或实现建议。',
    },
  },
  output: {
    schema: { type: 'string', description: '投递结果。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 写 Inbox(type=project, kind=notice, ticketId, message=text)
    //       kind 必须是 notice —— kind=ticket 会被项目编排读成「有活要干」
    // TODO: 不碰 Ticket.status、不写 TicketThread、不产生任何待办 —— 它不授权工作
    // TODO: 票已到终态时照常记录，但不因此复活它：项目编排看到的是「知道一下」，不是「有事要做」
    throw new Error('note_ticket 尚未实现')
  },
})
