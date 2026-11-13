import { defineTool } from '@deepseek-ai/dsh-tools'

/**
 * Supervisor 的 `list_ticket`：只看自己关联的那几张，无参数。
 * 主编排的全局版、项目编排的本项目版都是另外的工具，不要合并。
 */
export const list_ticket = defineTool({
  name: 'list_ticket',
  description: '列自己关联的工单及其进度。每次醒来先看它 —— 不要只信收件箱里那一条转述。',
  parameters: {},
  output: {
    schema: { type: 'string', description: '关联工单：id、项目、状态、prState、有无 pending ask。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 按 SupervisorTicket 查出本 Supervisor 的工单，带 status / prState / 有无 pending ask
    // TODO: 转述可能过时，票不会 —— 每次都读库，不要复用上一轮的记忆
    throw new Error('list_ticket 尚未实现')
  },
})

export const link_dependency = defineTool({
  name: 'link_dependency',
  description: '记一条跨项目前置依赖。方向是「后来的指向先要做的」。别只记在脑子里 —— 你随时可能被重启。',
  parameters: {
    ticketId: {
      type: 'string',
      required: true,
      description: '要等的那张票。',
    },
    dependsOn: {
      type: 'string',
      required: true,
      description: '必须先做完的那张票。',
    },
  },
  output: {
    schema: { type: 'string', description: '依赖记录结果。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 建 TicketLink(ticketId, relatedId=dependsOn, kind=depends)
    // TODO: dependsOn 到终态时插件给本 Supervisor 投一条 notice（保险；漏报不会让整条链路停摆）
    throw new Error('link_dependency 尚未实现')
  },
})

export const report = defineTool({
  name: 'report',
  description: '报给主编排，不等答复。',
  parameters: {
    state: {
      type: 'string',
      enum: ['progress', 'ready', 'failed', 'dropped'],
      required: true,
      description: 'progress 在跑 / ready 做完了 / failed 失败了 / dropped 不用做了。',
    },
    summary: {
      type: 'string',
      required: true,
      description: '一句话摘要。',
    },
  },
  output: {
    schema: { type: 'string', description: '是否已投递。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 投 Inbox(type=main, kind=notice)
    throw new Error('report 尚未实现')
  },
})

export const ask = defineTool({
  name: 'ask',
  description: '问主编排，这条线停下等答复。要加人、加项目、或需要上级拍板时用它。',
  parameters: {
    question: {
      type: 'string',
      required: true,
      description: '要主编排回答的问题，一句话说清。',
    },
  },
  output: {
    schema: { type: 'string', description: 'ask 的 id。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 建 Inbox(type=main, kind=ask, status=pending)
    throw new Error('ask 尚未实现')
  },
})

// 没有 close_self。收工是事实的推导，不是你的动作 —— 由插件按 SupervisorTicket 判定：
//   - 关联工单全部 done        → 自动 status=closed + closedAt，并给主编排投一条 notice
//   - 有工单 cancelled         → 只给主编排投 notice，由它决定 close / detach / 继续等
// 你既算不清「是不是真的都落地了」，忘了收工的代价又是留一个僵尸。
// 这两件事都不该压在一个随时可能被重启的会话上。
