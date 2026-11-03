import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig(
  globalIgnores([
    'dist',
    'coverage',
    'test-results',
    'playwright-report',
    'public',
    'docs',
    '**/*.d.ts',
    'src/services/**/*', // Temporarily ignore services with many console.logs
    'src/utils/**/*', // Temporarily ignore utils with many any types
  ]),
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      // A component defined during render remounts on every render and loses its state
      'react-hooks/static-components': 'error',
      // The other React Compiler rules (set-state-in-effect, immutability, purity, refs,
      // preserve-manual-memoization) only matter once the compiler is adopted; see docs/UPGRADE_NOTES.md
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-console': 'off',
      'no-empty': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/prefer-as-const': 'off',
      'no-constant-condition': 'off',
      'no-case-declarations': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['api/**/*.ts', 'e2e/**/*.ts', '*.config.{ts,js}'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**/*'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
);
