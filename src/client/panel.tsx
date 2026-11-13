import type { SidebarPanelIconOwnerProps } from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { ReactNode } from 'react'

export function Panel(): ReactNode {
  return (
    <div>
    </div>
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
