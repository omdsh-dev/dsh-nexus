import { defineTool } from '@deepseek-ai/dsh-tools'

/**
 * 主编排的版本：全部字段可见。
 * 项目编排的 `supervisor_list` 是另一个工具（本项目那张给明细、别人的只给数量），不要合并。
 */
export const supervisor_list = defineTool({
  name: 'supervisor_list',
  description: '列全部 Supervisor，字段完整：标题、原因、状态、关联工单、各自进度。',
  parameters: {
    status: {
      type: 'string',
      enum: ['active', 'closed'],
      description: '只看在协调中的或已收工的；省略表示只看 active。',
    },
  },
  output: {
    schema: { type: 'string', description: 'Supervisor 列表，含 title / reason / status / 关联工单。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 查全部 Supervisor，按 status 过滤，返回完整字段与关联工单
    throw new Error('supervisor_list 尚未实现')
  },
})

export const create_supervisor = defineTool({
  name: 'create_supervisor',
  description: '跨项目时拉起一个临时协调者：建记录并起会话，把双方上下文写进开场。',
  parameters: {
    title: {
      type: 'string',
      required: true,
      description: '一句话说明它在协调什么，例如「T-105 需要 B/x 配合」。',
    },
    reason: {
      type: 'string',
      required: true,
      description: '为什么拉起来，写清卡在哪，方便事后回溯。',
    },
    ticketIds: {
      type: 'array',
      items: { type: 'string' },
      required: true,
      description: '它协调的那几张票，通常每个项目一张。',
    },
  },
  output: {
    schema: { type: 'string', description: '新 Supervisor 的 id 与关联工单。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 建 Supervisor(status=active) + SupervisorTicket 行，并起它的会话
    // TODO: 开场 prompt 里要带双方上下文，否则它醒来只能看到收件箱那一条转述
    throw new Error('create_supervisor 尚未实现')
  },
})

export const close_supervisor = defineTool({
  name: 'close_supervisor',
  description: '关掉 Supervisor：status=closed，关联工单退回各自项目编排。reason 会原样进每个持票项目编排的收件箱。',
  parameters: {
    supervisorId: {
      type: 'string',
      required: true,
      description: '要关掉的 Supervisor。',
    },
    reason: {
      type: 'string',
      required: true,
      description: '为什么关。会原样进每个关联工单所属项目编排的收件箱 —— 它们要凭这句话决定那几张票接下来怎么办。写清是「做完了」还是「不做了、各自收摊」。',
    },
  },
  output: {
    schema: { type: 'string', description: '关闭结果，含通知到哪几个项目编排。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 写 status=closed + closedAt；行不删 —— 那几张票还指着它说明自己当初为什么存在
    // TODO: 按关联工单去重出项目清单，给每个项目编排各写一条 Inbox(type=project, kind=notice)：
    //       title 用 Supervisor 标题，message 用 reason 原文 + 该 Supervisor 名下属于本项目的票 id
    //       同一项目有多张票时只投一条，不要按票数重复
    // TODO: reason 落在 Inbox.message，不给 Supervisor 加字段 —— 表里只有 reason（创建原因），
    //       和 Ticket 只记 endedAt 不记结束原因一样，收尾原因归收件箱那份记录
    // TODO: 只动 Supervisor 与通知，不改任何票的 status —— 那几张票接下来怎么办是各项目编排自己的事
    throw new Error('close_supervisor 尚未实现')
  },
})

export const attach_tickets_to_supervisor = defineTool({
  name: 'attach_tickets_to_supervisor',
  description: '扩大 Supervisor 的范围：加关联工单，并自动通知该项目编排。',
  parameters: {
    supervisorId: {
      type: 'string',
      required: true,
      description: '要扩范围的 Supervisor。',
    },
    ticketIds: {
      type: 'array',
      items: { type: 'string' },
      required: true,
      description: '要加进去的票。',
    },
  },
  output: {
    schema: { type: 'string', description: '扩范围结果。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 建 SupervisorTicket 行；已存在则幂等
    // TODO: 自动写一条 Inbox(type=project) 通知该项目编排，调用方不用另外发
    throw new Error('attach_tickets_to_supervisor 尚未实现')
  },
})

export const detach_tickets_from_supervisor = defineTool({
  name: 'detach_tickets_from_supervisor',
  description: '缩小 Supervisor 的范围：去掉关联工单，退回原项目，并自动通知该项目编排。**不取消** —— 取消是人的决定。',
  parameters: {
    supervisorId: {
      type: 'string',
      required: true,
      description: '要缩范围的 Supervisor。',
    },
    ticketIds: {
      type: 'array',
      items: { type: 'string' },
      required: true,
      description: '要退回原项目的票。',
    },
    reason: {
      type: 'string',
      required: true,
      description: '为什么摘出来。会进退回票所属项目编排的收件箱 —— 它要凭这句话知道那张票现在归谁管、还要不要继续等。',
    },
  },
  output: {
    schema: { type: 'string', description: '缩范围结果，含通知到哪几个项目编排。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 删 SupervisorTicket 行，工单退回原项目编排
    // TODO: 按项目去重，各写一条 Inbox(type=project, kind=notice)，message 用 reason 原文 + 受影响的票 id
    // TODO: 只动关联关系，不改票的 status
    throw new Error('detach_tickets_from_supervisor 尚未实现')
  },
})
