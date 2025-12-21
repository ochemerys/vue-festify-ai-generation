import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    files: ['apps/frontend/**/*.{ts,vue}'],
    rules: {
      // Frontend-specific rules can be added here
    },
  },
  {
    files: ['apps/backend/**/*.ts'],
    rules: {
      // Backend-specific rules can be added here
    },
  },
  {
    ignores: [
      'dist/',
      'node_modules/',
      '**/*.js',
      '**/*.d.ts',
      'packages/*/dist/',
    ],
  },
]
