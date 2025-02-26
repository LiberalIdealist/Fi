module.exports = {
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  rules: {
    // Add any custom rules here
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { 
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '.*', // Ignore all variables
      'caughtErrorsIgnorePattern': '.*' // Ignore all caught errors
    }]
  }
};