import type { T } from '../locale'
import { useContext } from 'react'
import { PluginContext } from '../config/context'

/**
 * 面板命名空间的翻译函数。
 * @returns 绑定到 `dshNexus` 的 `t`。
 */
export function useTranslation(): { t: T } {
  return { t: useContext(PluginContext).t }
}
