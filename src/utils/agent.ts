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
          config: {
            persona: preset.instruction,
          },
        },
        ...(preset.plugins ?? []),
      ].filter(Boolean) as PresetDefinition['plugins'],
    },
  }
}
