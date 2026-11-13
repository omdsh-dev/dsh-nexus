import { defineTool } from '@deepseek-ai/dsh-tools'

export const read_channel = defineTool({
  name: 'read_channel',
  description: '读渠道原文，靠 resource 路径前缀分发。返回 { items, next_offset, next_resource }，两条翻页轴都要跟完。',
  parameters: {
    resource: {
      type: 'string',
      required: true,
      description: '资源路径，前缀决定分发：github/…、feishu/…、trigger/<id>、thread/<id>、ticket/<id>。',
    },
    offset: {
      type: 'integer',
      description: '从上一次的 next_offset 续读；0 表示重读同一份快照的开头。',
    },
    limit: {
      type: 'integer',
      description: '本次最多返回多少条；省略则用渠道默认值。',
    },
  },
  output: {
    schema: { type: 'string', description: '本条资源的正文分片，末尾附 next_offset / next_resource。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 按 resource 前缀分发到对应渠道读取器，统一返回 { items, next_offset, next_resource }
    // TODO: Worker 只能读本任务来源的资源；其余角色不限，越权直接报错
    // TODO: 分支 CI 这类没有地址的话题（ThreadKind=ci）不产生可回复地址，读可以，回复要报错
    throw new Error('read_channel 尚未实现')
  },
})

export const reply_channel = defineTool({
  name: 'reply_channel',
  description: '按触发在对应渠道发言。锚点是 triggerId，不用猜发到哪。排队成功不等于送达。',
  parameters: {
    triggerId: {
      type: 'string',
      required: true,
      description: '要回复的那条触发 id；回复发到这条触发所在的渠道地址。',
    },
    text: {
      type: 'string',
      required: true,
      description: '发言正文，像人话。渠道的上限由对应 skill 说明。',
    },
  },
  output: {
    schema: { type: 'string', description: '入队结果，例如 queued 或具体状态。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 由 triggerId 解析渠道地址，写 Outbox / 投递队列，返回排队状态
    // TODO: 触发没有回复地址（ThreadKind=ci）时必须明确报错，不能猜一个地方发
    // TODO: 同一票对同一地址按 seq 保序：前一条没发出去，后一条等着
    throw new Error('reply_channel 尚未实现')
  },
})
