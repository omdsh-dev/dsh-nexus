import { defineTool } from '@deepseek-ai/dsh-tools'

/**
 * Worker 的 `report`：没有 supervisorId。
 * Worker 不知道 Supervisor 存不存在，也不该知道 —— 它只有一个去处：项目编排。
 */
export const report = defineTool({
  name: 'report',
  description: '报告进度。发完继续干活，不等回复。要对方动脑子的走 ask。',
  parameters: {
    state: {
      type: 'string',
      enum: ['progress', 'ready', 'failed', 'dropped'],
      required: true,
      description: 'progress 在跑 / ready 干完了（PR 已开）/ failed 失败了 / dropped 不用做了。「我在等答复」不占状态位。',
    },
    summary: {
      type: 'string',
      required: true,
      description: '一句话摘要，短。给机器和面板看，详细解释写正文。',
    },
  },
  output: {
    schema: { type: 'string', description: '是否已投递。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 更新 Worker.report / reportAt，往项目编排投一条 Inbox(kind=ticket)
    // TODO: 票已结束时拒绝 —— 不要在一个已经作废的票上补报
    throw new Error('report 尚未实现')
  },
})

/**
 * Worker 的 `ask`：没有 supervisorId，只有一个去处 —— 项目编排。
 * 项目编排的 `ask` 是另一个工具（能带 supervisorId），不要合并。
 */
export const ask = defineTool({
  name: 'ask',
  description: '问项目编排。发完这条工作线停下，等答案被 prompt 回来。不要一边问一边继续做。',
  parameters: {
    question: {
      type: 'string',
      required: true,
      description: '要问的问题，一句话说清卡在哪。',
    },
  },
  output: {
    schema: { type: 'string', description: 'ask 的 id。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 建一条 Inbox(kind=ask, type=project)，停住这条工作线
    // TODO: 需求不清楚、要人拍板、要改别的仓库、权限或环境问题，都走这里
    throw new Error('ask 尚未实现')
  },
})
