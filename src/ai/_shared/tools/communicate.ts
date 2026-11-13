import { defineTool } from '@deepseek-ai/dsh-tools'

export const answer = defineTool({
  name: 'answer',
  description: '回答下面升上来的 ask：填 answer，标 status=done，答案送回发起方。',
  parameters: {
    askId: {
      type: 'string',
      required: true,
      description: '要回答的那条 ask 的 Inbox id。',
    },
    text: {
      type: 'string',
      required: true,
      description: '答案正文。发起方会原样收到。',
    },
  },
  output: {
    schema: { type: 'string', description: '是否已回送。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 写 Inbox.answer / answeredBy=当前身份 / status=done，并把答案 prompt 回发起方会话
    // TODO: 只能答指向自己的 ask，不能越级代答
    throw new Error('answer 尚未实现')
  },
})
