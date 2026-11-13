import type { ClientContext } from '../types/context'
import { useContext } from 'react'
import { PluginContext } from '../config/context'

/**
 * DSH 客户端上下文。
 * @returns 插件拿到的那份 Client Cordis 上下文。
 */
export function useDshContext(): ClientContext {
  return useContext(PluginContext).ctx
}
