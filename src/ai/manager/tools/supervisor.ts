import { defineTool } from '@deepseek-ai/dsh-tools'

/**
 * 项目编排的版本：本项目那张给明细，别人的只给数量。
 * 主编排的 `supervisor_list` 是另一个工具（全部字段可见），不要合并。
 */
export const supervisor_list = defineTool({
  name: 'supervisor_list',
  description: '看 Supervisor：本项目相关的给明细，其余只给数量。',
  parameters: {
    status: {
      type: 'string',
      enum: ['active', 'closed'],
      description: '只看在协调中的或已收工的；省略表示只看 active。',
    },
  },
  output: {
    schema: { type: 'string', description: '本项目那一张展开全部字段；其他 Supervisor 只给条数。' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  execute: async () => {
    // TODO: 查 Supervisor，把包含本项目工单的那张展开（title / status / 关联工单），其余只返回数量
    throw new Error('supervisor_list 尚未实现')
  },
})
