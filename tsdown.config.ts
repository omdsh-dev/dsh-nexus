import type { UserConfig } from 'tsdown'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import pluginBabel from '@rolldown/plugin-babel'
import { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'tsdown'
import { StaleGuardRecorder } from 'tsdown-stale-guard'

export const neverBundle = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  /^@deepseek-ai\//,
]

/**
 * Packages the browser module table provides at runtime. Everything else the
 * Client half imports — browser-safe helpers such as `@reause/core` — must be
 * bundled, or the factory throws `Cannot find module` while loading and no
 * slot ever registers.
 */
export const clientNeverBundle = [...neverBundle, 'node:*']

/** Client-safe dependencies that must be inlined into the Client artifact. */
export const clientAlwaysBundle = [/^@reause\//, /^react-compiler-runtime$/]

const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as { name: string }
const id = JSON.stringify(pkg.name)

const common: UserConfig = {
  outDir: 'dist',
  format: 'esm',
  outExtensions: () => ({ js: '.js' }),
  publint: true,
  deps: { neverBundle },
  plugins: [StaleGuardRecorder()],
}

export default defineConfig([
  {
    ...common,
    entry: { index: 'src/index.ts' },
    dts: true,
    sourcemap: false,
    clean: true,
  },
  {
    ...common,
    entry: { client: 'src/client/index.tsx' },
    // Client bundles are classic scripts consumed by dsh-client-modules.
    // CJS output is required so its exports remain inside the loader factory.
    format: 'cjs',
    outExtensions: () => ({ js: '.cjs' }),
    deps: { neverBundle: clientNeverBundle, alwaysBundle: clientAlwaysBundle },
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
    banner: `window.__ModuleLoader__.load({id:${id},factory:(require)=>{var module={exports:{}};var exports=module.exports;`,
    footer: 'return module.exports;}});',
    // The Host shell provides React 18, which has no `react/compiler-runtime`
    // entry; target 18 makes React Compiler emit `react-compiler-runtime`,
    // a standalone runtime bundled into this artifact.
    plugins: [
      pluginBabel({
        presets: [reactCompilerPreset({ target: '18' })],
      }),
    ],
    dts: false,
    platform: 'neutral',
    sourcemap: true,
    // minify: true,
    clean: false,
  },
])
