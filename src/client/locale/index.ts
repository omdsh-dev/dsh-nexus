import type { Translate } from '@deepseek-ai/dsh-client-ui-slots'

export const dicts = {
  zh: {
    panel: 'Nexus',
    title: 'Nexus',
    desc: '多渠道协作与任务编排',
    openMainSession: '打开主会话',
    tabsLabel: '面板分区',
    tabOverview: '概览',
    tabTickets: '任务',
    tabTriggers: '触发',
    tabChannels: '渠道',
    tabSettings: '设置',
    sessionListNotReady: '会话列表未就绪',
    sessionNotListed: '会话未被列出',
  },
  en: {
    panel: 'Nexus',
    title: 'Nexus',
    desc: 'Multi-channel collaboration and task orchestration',
    openMainSession: 'Open main session',
    tabsLabel: 'Panel sections',
    tabOverview: 'Overview',
    tabTickets: 'Tasks',
    tabTriggers: 'Triggers',
    tabChannels: 'Channels',
    tabSettings: 'Settings',
    sessionListNotReady: 'Session list not ready',
    sessionNotListed: 'Session not listed',
  },
} as const

export type DshNexusKey = keyof typeof dicts.zh | keyof typeof dicts.en
declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap { dshNexus: DshNexusKey }
}
export type T = Translate<DshNexusKey>
