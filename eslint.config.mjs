// @ts-chec k
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

// This is just an example default config for ESLint.
// You should change it to your needs following the documentation.
export default tseslint.config(
  eslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  // 'plugin:import/typescript',
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      'import/order': [
        'error',
        {
          groups: [['external', 'builtin'], 'internal'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
    // other configs...
  },
  {
    files: ['src/**/*.js', 'src/**/*.mts'],
    ignores: [
      '**/tmp/**',
      '**/coverage/**',
      '/node_modules/**',
      '/tools/**',
    ],
    extends: [
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],
    // other configs...
  },
  {
    extends: [...tseslint.configs.recommended],

    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },

    rules: {
      'comma-dangle': ['error', 'always-multiline'],
      'import/no-dynamic-require': 'warn',
      'import/no-nodejs-modules': 'off',
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      '@typescript-eslint/no-unused-vars': [
        'warn', // or 'error'
        {
          'argsIgnorePattern': '^_',
          'varsIgnorePattern': '^_',
          'caughtErrorsIgnorePattern': '^_'
        }
      ],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      // '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },

    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2020,
      sourceType: 'module',

      globals: {
        ...globals.node,
      },

      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },
  {
    ignores: [
      '**/dist/**',
      '**/tmp/**',
      '/node_modules/**',
      '/tools/**',
    ],
  },
);
