import type { PropsStore } from '@deepseek-ai/dsh-client-store'
import type { T } from '../locale'
import type { store } from '../store'
import type { ClientContext } from '../types/context'
import { noop } from '@reause/core'
import { createContext } from 'react'

/** 官方 `store` 座位交给面板组件的读写两侧。 */
export type AppStore = PropsStore<typeof store>

/** 面板 store 的状态类型；由官方座位的选择器签名推出来，不重复声明。 */
export type AppStoreState = Parameters<Parameters<AppStore['useStore']>[0]>[0]

/** 面板组件的共享座位：上下文、翻译、store 读写。 */
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
