import type { Translate } from '@deepseek-ai/dsh-client-ui-slots'

export const dicts = {
  zh: {
    panel: 'Nexus',
    sessionListNotReady: '会话列表未就绪',
    sessionNotListed: '会话未被列出',
  },
  en: {
    panel: 'Nexus',
    sessionListNotReady: 'Session list not ready',
    sessionNotListed: 'Session not listed',
  },
} as const

export type DshNexusKey = keyof typeof dicts.zh | keyof typeof dicts.en
declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap { dshNexus: DshNexusKey }
}
export type T = Translate<DshNexusKey>
