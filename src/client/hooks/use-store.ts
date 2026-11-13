import type { AppStore, AppStoreState } from '../config/context'
import { useContext } from 'react'
import { PluginContext } from '../config/context'

/**
 * 从面板 store 里选一片状态。
 * @param select - 状态选择器，拿到的就是复合状态。
 * @returns 选中的值，按 Object.is 比较。
 */
export function useStore<S>(select: (state: AppStoreState) => S): S {
  return useContext(PluginContext).useStore(select)
}

/**
 * 面板 store 的写侧。
 * @returns 官方烘焙过的动作集，形参已去掉 draft。
 */
export function useActions(): AppStore['actions'] {
  return useContext(PluginContext).actions
}
