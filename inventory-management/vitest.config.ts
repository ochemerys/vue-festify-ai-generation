import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [
      './apps/backend/src/__tests__/env-setup.ts',
      './apps/backend/src/__tests__/setup.ts'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.idea/**',
      '**/.git/**',
      '**/.cache/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/__tests__/**',
        '**/vitest.config.ts',
        '**/vite.config.ts',
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true, // Serial execution for integration tests
      },
    },
    testTimeout: 30000, // 30 seconds for integration tests
    hookTimeout: 30000,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: process.env.DATABASE_TEST_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/inventory_test',
      DATABASE_TEST_URL: process.env.DATABASE_TEST_URL || 'postgresql://postgres:postgres@localhost:5433/inventory_test',
      JWT_SECRET: 'test-jwt-secret-key',
    },
  },
  resolve: {
    alias: {
      '@inventory/contracts': path.resolve(__dirname, './packages/contracts/src'),
      '@inventory/db': path.resolve(__dirname, './packages/db/src'),
    },
  },
})
