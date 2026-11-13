import type { MainPanelId } from '@deepseek-ai/dsh-client-ui-layout/client'

/**
 * Client-safe constants only: this module is bundled into the browser Client
 * artifact, so it must never import Node builtins. Host-only paths live in
 * `./paths`.
 */

export const PANEL_ID = 'dsh-nexus' as MainPanelId

export const PLUGIN_ID = 'dsh-nexus' as const

export const ENTRY = 'dsh-nexus' as const

export const NS = 'dshNexus' as const
