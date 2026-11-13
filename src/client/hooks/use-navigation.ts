import type { TabKind } from '../store'
import { useActions, useStore } from './use-store'

/**
 * 当前路由。
 * @returns store 里 `navigation` 那一片的页面值。
 */
export function usePage(): TabKind {
  return useStore(state => state.navigation.page)
}

/**
 * 切页面的动作。
 * @returns 接收目标页面的回调；详情页也走它。
 */
export function useNavigate(): (page: TabKind) => void {
  return useActions().go
}
