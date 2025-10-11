//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  ...tanstackConfig,
  { ignores: ['commitlint.config.js'] },

  {
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
])
