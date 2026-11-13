import { defineTool } from '@deepseek-ai/dsh-tools'

/**
 * 项目编排的 `report`：能带 supervisorId。
 * Worker 的 `report` 是另一个工具（没有 supervisorId，它不知道 Supervisor 存在），不要合并。
 */
export const report = defineTool({
  name: 'report',
  description: '向上级报事实：状态 + 一句话摘要。发完继续，不等答复。',
  parameters: {
    state: {
      type: 'string',
      enum: ['progress', 'ready', 'failed', 'dropped'],
      required: true,
      description: 'progress 在跑 / ready 干完了 / failed 失败了 / dropped 不用做了。',
    },
    summary: {
      type: 'string',
      required: true,
      description: '一句话摘要。给机器和面板看，短。',
    },
    supervisorId: {
      type: 'string',
      description: '本票在某个 Supervisor 下且进入终态时必须带，否则那边一直等。不带则报给主编排。',
    },
    ticketId: {
      type: 'string',
      description: '只做溯源，写进 Inbox.ticketId，不参与路由。',
    },
  },
  output: {
    schema: { type: 'string', description: '是否已投递。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 往 Inbox 投一条 kind=ticket；带 supervisorId 路由到该 Supervisor，否则投给主编排
    // TODO: ticketId 只写入 Inbox.ticketId 溯源，不参与路由 —— 路由只认 supervisorId
    throw new Error('report 尚未实现')
  },
})

/**
 * 项目编排的 `ask`：能带 supervisorId。
 * Worker 的 `ask` 是另一个工具（没有 supervisorId），不要合并。
 */
export const ask = defineTool({
  name: 'ask',
  description: '向上级提问。发完这条工作线停下，答案到了会被 prompt 回来；会话本身继续处理别的票。',
  parameters: {
    question: {
      type: 'string',
      required: true,
      description: '要上级回答的问题，一句话说清。',
    },
    supervisorId: {
      type: 'string',
      description: '本票在某个 Supervisor 下时，问题直接进它，不再绕主编排。',
    },
    ticketId: {
      type: 'string',
      description: '只做溯源，写进 Inbox.ticketId，不参与路由。',
    },
  },
  output: {
    schema: { type: 'string', description: 'ask 的 id 与投递去向。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 建一条 Inbox(kind=ask, status=pending)，按 supervisorId 与否决定路由
    // TODO: 挂起「这条工作线」而不是挂起会话
    throw new Error('ask 尚未实现')
  },
})

export const escalate = defineTool({
  name: 'escalate',
  description: '把一条已有的 ask 原样上交：问题文本不改，就地改 type 换处理者。',
  parameters: {
    askId: {
      type: 'string',
      required: true,
      description: '要上交的那条 ask 的 Inbox id。',
    },
  },
  output: {
    schema: { type: 'string', description: '上交后的处理者。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 就地改 type 为上级、escalations+1、lastEscalatedAt=now、deadline 重置、status 保持 pending
    // TODO: 不新建记录 —— 一个问题只有一条记录、一个身份；只有从 type=user 升级出去的那一次要回渠道补一句话
    throw new Error('escalate 尚未实现')
  },
})
