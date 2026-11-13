// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
    pnpm: true,
    rules: {
      'pnpm/yaml-enforce-settings': 'off',
    },
    ignores: [
      'soruce/*',
      'src/database/migrations.ts',
      'src/database/types.ts',
    ],
  },
)
