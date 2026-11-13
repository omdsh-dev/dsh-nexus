import { definePreset } from '../../utils/agent'
import { plugins, sharedTools } from '../_shared'
import { getSupervisorSystemPrompt } from '../_shared/prompts'
import * as tools from './tools'

export const supervisor = definePreset({
  id: 'supervisor',
  name: 'Supervisor',
  instruction: getSupervisorSystemPrompt(),
  description: '',
  order: 6,
  tools: [
    sharedTools.channel.read_channel,

    sharedTools.communicate.answer,

    sharedTools.inbox.inbox_list,
    sharedTools.inbox.inbox_kill,

    sharedTools.ticket.dispatch_ticket,
    sharedTools.ticket.note_ticket,

    tools.list_ticket,

    tools.report,
    tools.ask,

    tools.link_dependency,
  ],
  plugins: [
    plugins.agentInstructions,
    plugins.compaction,
    plugins.commandGoal,
    plugins.delegation,
    plugins.skillFilesystem,
    plugins.timeContext,
    plugins.toolBash,
    plugins.toolExecutorPtc,
    plugins.toolFs,
    plugins.toolFsSearch,
    plugins.toolJobs,
    plugins.toolPresent,
    plugins.toolPwsh,
    plugins.toolSkill,
    plugins.toolTodo,
    plugins.toolWeb,
  ],
})
