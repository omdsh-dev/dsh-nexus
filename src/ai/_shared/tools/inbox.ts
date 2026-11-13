import { defineTool } from '@deepseek-ai/dsh-tools'

export const inbox_list = defineTool({
  name: 'inbox_list',
  description: '列出自己收件箱里 status=pending 的消息，按 createdAt 升序。',
  parameters: {
    detail: {
      type: 'boolean',
      description: 'true 时返回每条消息的正文；默认只给 id、kind 和一句话摘要。',
    },
  },
  output: {
    schema: { type: 'string', description: '收件箱消息列表，每条一行。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 读 Inbox 表，按会话身份过滤 type（main / project / supervisor）且 status=pending，按 createdAt 升序
    // TODO: detail=false 时只返回 id / kind / 摘要；detail=true 时附正文
    throw new Error('inbox_list 尚未实现')
  },
})

export const inbox_kill = defineTool({
  name: 'inbox_kill',
  description: '把收件箱消息标为 done。不需要先读，可以批量。',
  parameters: {
    ids: {
      type: 'array',
      items: { type: 'string' },
      required: true,
      description: '要标为 done 的收件箱 id 列表。',
    },
  },
  output: {
    schema: { type: 'string', description: '实际标为 done 的条数。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 把给定 id 的 Inbox 行写 status=done + doneAt，返回受影响条数
    // TODO: 不属于当前会话的 id 必须拒绝，不能跨身份改别人的收件箱
    throw new Error('inbox_kill 尚未实现')
  },
})
