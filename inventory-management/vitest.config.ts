import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    environmentMatchGlobs: [['apps/frontend/**', 'jsdom']],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.d.ts', '**/index.ts', 'apps/frontend/src/main.ts'],
    },
  },
  resolve: {
    alias: {
      '@inventory/contracts': path.resolve(__dirname, './packages/contracts/src'),
      '@inventory/db': path.resolve(__dirname, './packages/db/src'),
    },
  },
})
