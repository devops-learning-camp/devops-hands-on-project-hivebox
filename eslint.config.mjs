// @ts-check

import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  // keep ESLint ignores aligned with tsconfig exclusions
  globalIgnores([
    'node_modules/',
    'dist/',
    'tests/',
    '**/*.test.ts',
    '**/*.spec.ts',
  ])
);
