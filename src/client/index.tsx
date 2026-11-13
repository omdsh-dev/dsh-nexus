import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'

import type {} from '@deepseek-ai/dsh-client-ui-workspace/client'
import type { ClientContext } from './types/context'
import { NS, PANEL_ID } from '../config/constants'
import { PluginContext } from './config/context'
import { dicts } from './locale'
import { Panel, PanelIcon } from './panel'
import { store } from './store'

export const inject = ['slots', 'locale', 'sessions', 'uiWorkspace']

export function apply(ctx: ClientContext): void {
  ctx.effect(
    () => ctx.locale.register(NS, dicts),
    `${NS}: dictionaries`,
  )

  const t = ctx.locale.bind(NS)

  ctx.slots.inject('main', () => ctx.slots.register(
    {
      name: 'main',
      key: PANEL_ID,
      locale: NS,
      store,
    },
    props => (
      <PluginContext.Provider value={{
        ctx,
        t: props.t,
        useStore: props.useStore,
        actions: props.actions,
      }}
      >
        <Panel />
      </PluginContext.Provider>
    ),
  ))

  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register(
    {
      name: 'sidebar.panellist',
      id: PANEL_ID,
      order: 10,
      label: () => t('panel'),
      locale: NS,
    },
    PanelIcon,
  ))
}
