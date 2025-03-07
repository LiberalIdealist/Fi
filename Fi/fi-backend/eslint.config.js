import { FlatCompat } from '@eslint/eslintrc';
import eslint from 'eslint';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

const compat = new FlatCompat({
  // Pass the recommended config as required
  recommendedConfig: eslint.configs?.recommended || { rules: {} }
});

export default [
  {
    // Global ignores
    ignores: ['node_modules/**', 'dist/**', 'temp/**']
  },
  {
    // TypeScript files
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      // Your rules here
    }
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    }
  }
];