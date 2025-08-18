
const js = require('@eslint/js');
const globals = require('globals');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const reactRefresh = require('eslint-plugin-react-refresh');
const tseslint = require('typescript-eslint');
const { globalIgnores } = require('eslint/config');

module.exports = tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      react,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'no-console': 'warn',
      'no-unused-expressions': 'error',
      'prefer-const': 'error',
      'no-duplicate-imports': 'warn',
      'no-empty-pattern': 'warn',
      'no-return-await': 'warn',
      'no-promise-executor-return': 'warn',
      'require-await': 'warn',
      'no-throw-literal': 'off',
      'react/jsx-no-bind': [
        'error',
        { ignoreDOMComponents: true, allowArrowFunctions: false },
      ],
      'react/jsx-curly-spacing': 'warn',
      'react/jsx-equals-spacing': 'warn',
      'react/jsx-no-constructed-context-values': 'warn',
      'react/jsx-no-useless-fragment': 'warn',
      'react/jsx-props-no-spreading': [
        'warn',
        { custom: 'ignore', explicitSpread: 'enforce' },
      ],
      'react/self-closing-comp': [
        'error',
        { component: true, html: true },
      ],
      'react/function-component-definition': [
        'error',
        { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
      ],
      'react/jsx-pascal-case': [
        'error',
        {
          allowAllCaps: true,
          allowNamespace: true,
          allowLeadingUnderscore: false,
          ignore: [],
        },
      ],
      'react/jsx-max-depth': ['error', { max: 50 }],
      'react/jsx-filename-extension': [1, { extensions: ['.ts', '.tsx'] }],
      'react/jsx-handler-names': ['warn'],
      'react/jsx-key': 'warn',
      'react/no-access-state-in-setstate': 'warn',
      'react/no-deprecated': 'warn',
      'react/no-multi-comp': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
]);
