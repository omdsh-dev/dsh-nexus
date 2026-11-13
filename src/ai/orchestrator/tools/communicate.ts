import { defineTool } from '@deepseek-ai/dsh-tools'

export const ask_user = defineTool({
  name: 'ask_user',
  description: '问人。只有主编排能问 —— 它是唯一能触达人类的一层。',
  parameters: {
    question: {
      type: 'string',
      required: true,
      description: '要人回答的问题。写成人类听得懂的一句话，不要带技术黑话。',
    },
    triggerId: {
      type: 'string',
      description: '问题发到哪个渠道；给了就锚在这条触发上，省略则只留在面板里。',
    },
  },
  output: {
    schema: { type: 'string', description: 'ask 的 id 与投递去向。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 建 Inbox(type=user, kind=ask, status=pending)；有 triggerId 就按该触发发到对应渠道
    // TODO: 人一直不答就停在 type=user，不要代答，也不要重复问
    throw new Error('ask_user 尚未实现')
  },
})
