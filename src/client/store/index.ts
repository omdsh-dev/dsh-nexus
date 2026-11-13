import { defineStore } from '@deepseek-ai/dsh-client-store'

/**
 * 面板路由。五个页签，外加它们的详情页；目前只有渠道有详情。
 *
 * 不搬真路由 —— 路径只是个状态值，切换由面板自己完成。
 */
export type TabKind = 'overview' | 'ticket' | 'trigger' | 'channel' | 'channel/detail' | 'setting'

/** 页签顺序即数组顺序。`channel/detail` 不在里面，它不是页签。 */
export const TABS = [
  { kind: 'overview', label: 'tabOverview' },
  { kind: 'ticket', label: 'tabTickets' },
  { kind: 'trigger', label: 'tabTriggers' },
  { kind: 'channel', label: 'tabChannels' },
  { kind: 'setting', label: 'tabSettings' },
] as const satisfies readonly { readonly kind: TabKind, readonly label: string }[]

/**
 * 路由归属的页签：取路径第一段，任意 `xxx/yyy` 都落到 `xxx` 页签。
 * @param page - 当前路由。
 * @returns 要高亮的页签。
 */
export function tabOf(page: TabKind): TabKind {
  const [tab] = page.split('/')
  return tab as TabKind
}

export const store = defineStore({
  init: () => ({
    navigation: { page: 'overview' as TabKind },
  }),
  actions: {
    go: (draft, page: TabKind) => {
      draft.navigation.page = page
    },
  },
})
