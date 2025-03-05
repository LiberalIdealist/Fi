import { FlatCompat } from '@eslint/eslintrc';
import eslint from 'eslint';

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
    files: ['**/*.ts'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      'prefer-const': 'warn'
    }
  }
];