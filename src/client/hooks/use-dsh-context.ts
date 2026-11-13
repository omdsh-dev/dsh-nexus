import type { ClientContext } from '../types/context'
import { useContext } from 'react'
import { PluginContext } from '../config/context'

export function useDshContext(): ClientContext {
  return useContext(PluginContext).ctx
}
