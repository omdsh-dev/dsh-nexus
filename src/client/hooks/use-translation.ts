import type { T } from '../locale'
import { useContext } from 'react'
import { PluginContext } from '../config/context'

export function useTranslation(): { t: T } {
  const t = useContext(PluginContext).t
  return { t }
}
