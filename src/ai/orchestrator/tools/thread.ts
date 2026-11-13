import { defineTool } from '@deepseek-ai/dsh-tools'

export const triage_thread = defineTool({
  name: 'triage_thread',
  description: '给一条还没票跟着的话题定归属。判一次就固定，之后不再打扰主编排。',
  parameters: {
    threadId: {
      type: 'string',
      required: true,
      description: '话题 id，形如 github:42 或 feishu:<chat>:<root>。',
    },
    action: {
      type: 'string',
      enum: ['claim', 'ignore'],
      required: true,
      description: 'claim 归给某个项目；ignore 判为不用处理，之后不投递，除非有人又 @ 了我们。',
    },
    projectId: {
      type: 'string',
      description: 'action=claim 时必给：话题归哪个项目。',
    },
  },
  output: {
    schema: { type: 'string', description: '写入后的 triage 结论。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 写 Thread.triage + triagedAt；action=claim 时 projectId 必填，缺了要报错
    // TODO: claim 之后这条话题的后续触发直接投给该项目编排，不再进主编排收件箱
    throw new Error('triage_thread 尚未实现')
  },
})

export const attach_thread_to_ticket = defineTool({
  name: 'attach_thread_to_ticket',
  description: '让一张已有的票接管一条新话题：建订阅并投递。跨项目也走它。只有消息明确指向那张票才挂。',
  parameters: {
    ticketId: {
      type: 'string',
      required: true,
      description: '接管这条话题的票。已被人叫停（cancelled）的票挂不上。',
    },
    threadId: {
      type: 'string',
      required: true,
      description: '要挂上去的话题 id。',
    },
    note: {
      type: 'string',
      description: '一句话路由背景或人给的约束，不要写实现建议，也不要复述原文。',
    },
  },
  output: {
    schema: { type: 'string', description: '挂载结果。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 建 TicketThread(ticketId, threadId)；已存在则幂等返回
    // TODO: 投递：写 Inbox(type=project, kind=ticket, ticketId)，让项目编排把它 send 给 Worker
    // TODO: 不写 Thread.triage —— 归属和订阅是两件事，写它会让 attach / unlink 不对称
    // TODO: 票已 cancelled 时拒绝挂载
    throw new Error('attach_thread_to_ticket 尚未实现')
  },
})

export const unlink_thread = defineTool({
  name: 'unlink_thread',
  description: '摘掉挂错的话题，和 attach 严格对称：只删订阅一行，不动话题归属。',
  parameters: {
    ticketId: {
      type: 'string',
      required: true,
      description: '要摘掉订阅的票。',
    },
    threadId: {
      type: 'string',
      required: true,
      description: '要摘掉的话题 id。这张票的触发来源那条不许摘。',
    },
    reason: {
      type: 'string',
      required: true,
      description: '一句话说明为什么不相关，写进记录供回溯。',
    },
  },
  output: {
    schema: { type: 'string', description: '摘除结果。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 删 TicketThread(ticketId, threadId) 一行
    // TODO: 触发来源（该票 TicketThread 里 createdAt 最早那条）不许摘，要明确报错
    // TODO: 不碰 Thread.triage —— 摘掉订阅后路由自然回到话题原本的归属
    throw new Error('unlink_thread 尚未实现')
  },
})
