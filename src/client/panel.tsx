import type { SegmentedTab } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SidebarPanelIconOwnerProps } from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { ReactNode } from 'react'
import type { TabKind } from './store'
import { Button, SegmentedTabs } from '@deepseek-ai/dsh-client-ui-primitives'
import { useId } from 'react'
import { Case, Switch } from 'react-if-lite'
import { useNavigate, usePage } from './hooks/use-navigation'
import { useTranslation } from './hooks/use-translation'
import { tabOf, TABS } from './store'
import { Channel } from './ui/channel'
import { ChannelDetail } from './ui/channel-detail'
import { Overflow } from './ui/overview'
import { Setting } from './ui/setting'
import { Ticket } from './ui/ticket'
import { Trigger } from './ui/trigger'

/**
 * 把官方的分段控件覆盖成 `soruce/dsh-superagent-prototype` 的下划线页签。
 *
 * 官方组件把自己的 CSS Modules 类挂在容器和页签上，改不动那层样式，
 * 只能从父级后代选择器压过去 —— 带 `!` 的几个是官方也声明了的属性，
 * 其余（gap、底边、下划线）是新加的，不需要。
 */
const TABS_CLASS = [
  'flex! gap-5 overflow-x-auto p-0! rounded-none! bg-transparent!',
  'border-b-[0.5px] border-b-[var(--dsw-alias-border-l3)]',
  // 官方那个滑动指示块不要
  '[&>span]:hidden',
  '[&>button]:h-[34px]! [&>button]:shrink-0 [&>button]:rounded-none! [&>button]:border-0!',
  '[&>button]:bg-transparent! [&>button]:px-0.5! [&>button]:font-normal!',
  '[&>button]:text-[var(--dsw-alias-label-tertiary)]!',
  '[&>button:hover]:text-[var(--dsw-alias-label-primary)]!',
  '[&>button[aria-selected=true]]:bg-transparent!',
  '[&>button[aria-selected=true]]:font-medium!',
  '[&>button[aria-selected=true]]:text-[var(--dsw-alias-label-primary)]!',
  '[&>button[aria-selected=true]]:shadow-[inset_0_-1.5px_0_var(--dsw-alias-label-primary)]',
].join(' ')

/**
 * Nexus 主面板。
 *
 * 版面照官方管理页：整页滚动、内容列最宽 960px、24–48px 响应式留白、
 * 20px 标题加一行 13px 说明。搜索框和标题旁的信息按钮不搬。
 *
 * 面板不接收任何 props：上下文、翻译、路由都从 `hooks/*` 读。
 */
export function Panel(): ReactNode {
  const { t } = useTranslation()
  const page = usePage()
  const navigate = useNavigate()

  // useId 在 React 18 里带冒号，去掉后 id 才能安全地进选择器。
  const tabsId = useId().replaceAll(':', '')

  const items = TABS.map(tab => ({
    value: tab.kind,
    label: t(tab.label),
    id: `${tabsId}-${tab.kind}`,
    panelId: `${tabsId}-${tab.kind}-panel`,
  })) as [SegmentedTab<TabKind>, ...SegmentedTab<TabKind>[]]

  const tab = tabOf(page)

  return (
    <section className="flex h-full w-full flex-col items-center overflow-y-auto px-[clamp(24px,4vw,48px)] text-[var(--dsw-alias-label-primary)]">
      <header className="flex w-full max-w-[960px] flex-none flex-col gap-4 pt-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl leading-7 font-medium">{t('title')}</h1>
            <p className="mt-1 text-[13px] leading-5 text-[var(--dsw-alias-label-secondary)]">{t('desc')}</p>
          </div>
          {/* 打开主会话：点击行为待接。 */}
          <Button variant="outline" size="sm">{t('openMainSession')}</Button>
        </div>
        <SegmentedTabs
          size="sm"
          items={items}
          value={tab}
          onChange={kind => navigate(kind)}
          label={t('tabsLabel')}
          className={TABS_CLASS}
        />
      </header>

      <div
        id={`${tabsId}-${tab}-panel`}
        role="tabpanel"
        aria-labelledby={`${tabsId}-${tab}`}
        className="mt-6 flex w-full max-w-[960px] flex-none flex-col gap-6"
      >
        <Switch value={page}>
          <Case cond="overview"><Overflow /></Case>
          <Case cond="ticket"><Ticket /></Case>
          <Case cond="trigger"><Trigger /></Case>
          <Case cond="channel"><Channel /></Case>
          <Case cond="channel/detail"><ChannelDetail /></Case>
          <Case cond="setting"><Setting /></Case>
        </Switch>
      </div>
    </section>
  )
}

export function PanelIcon({ size }: SidebarPanelIconOwnerProps): ReactNode {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 3.5h9l3.5 1.75v2.5L15 9.5H6a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z" />
      <path d="M10 9.5v10.25a1.75 1.75 0 0 0 3.5 0V9.5" />
      <path d="M10 15.5h3.5" />
    </svg>
  )
}
