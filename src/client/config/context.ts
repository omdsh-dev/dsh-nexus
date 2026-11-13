import type { T } from '../locale'
import type { ClientContext } from '../types/context'
import { noop } from '@reause/core'
import { createContext } from 'react'

export const PluginContext = createContext({
  ctx: {} as ClientContext,
  t: noop as unknown as T,
})
