import type { Page } from '../store'
import { useActions, useStore } from './use-store'

export function usePage(): Page {
  return useStore(state => state.navigation.page)
}

export function useNavigate(): (page: Page) => void {
  return useActions().go
}
