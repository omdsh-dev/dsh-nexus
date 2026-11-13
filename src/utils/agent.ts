import type { PresetDefinition } from '@deepseek-ai/dsh-agent-preset-registry'
import type { ToolDefinition } from '@deepseek-ai/dsh-tools'

export interface AgentDefinition extends PresetDefinition {
  instruction?: string
  tools: ToolDefinition[]
}

export interface AgentPreset {
  preset: PresetDefinition
  tools: ToolDefinition[]
}

export function definePreset(definition: Omit<AgentDefinition, 'tools'> & { tools?: ToolDefinition[] }): AgentPreset {
  const { tools, ...preset } = definition
  return {
    tools: tools ?? [],
    preset: {
      ...preset,
      plugins: [
        preset.instruction && {
          id: 'persona',
          name: '@deepseek-ai/dsh-persona',
          // persona 行的 Config 是 `prefix` / `suffix` / `complete`，
          // 传别的键会让这一行配置校验失败、整个预设被标成 broken。
          config: {
            prefix: preset.instruction,
          },
        },
        ...(preset.plugins ?? []),
      ].filter(Boolean) as PresetDefinition['plugins'],
    },
  }
}
