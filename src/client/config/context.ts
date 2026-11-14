import type { PropsStore } from '@deepseek-ai/dsh-client-store'
import type { T } from '../locale'
import type { store } from '../store'
import type { ClientContext } from '../types/context'
import { noop } from '@reause/core'
import { createContext } from 'react'

export type AppStore = PropsStore<typeof store>
export type AppStoreState = Parameters<Parameters<AppStore['useStore']>[0]>[0]

export interface PluginContextValue extends AppStore {
  ctx: ClientContext
  t: T
}

export const PluginContext = createContext<PluginContextValue>({
  ctx: {} as ClientContext,
  t: noop as unknown as T,
  useStore: {} as AppStore['useStore'],
  actions: {} as AppStore['actions'],
})
