import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import eslintPluginImport from 'eslint-plugin-import'
import eslintPluginTsdoc from 'eslint-plugin-tsdoc'
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

import reactCompiler from 'eslint-plugin-react-compiler'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.strictTypeChecked,
      prettier,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      sourceType: 'module',
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'react-x': reactX,
      'react-dom': reactDom,
      tsdoc: eslintPluginTsdoc,
      import: eslintPluginImport,

      'react-compiler': reactCompiler,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      ...reactX.configs['recommended-typescript'].rules,
      ...reactDom.configs.recommended.rules,

      'react-compiler/react-compiler': 'error',

      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      'no-restricted-syntax': [
        'error',
        // Ban all enums:
        {
          selector: 'TSEnumDeclaration',
          message:
            'Use const assertion or a string union type instead. https://mkosir.github.io/typescript-style-guide/#enums--const-assertion',
        },
      ],
      'import/no-default-export': 'error',
      // In case of exceptions disable the rule
      overrides: [
        {
          files: ['src/assets/**/*'],
          rules: { 'import/no-default-export': 'off' },
        },
      ],
      'no-unused-vars': 'off',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
        },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'generic',
          readonly: 'generic',
        },
      ],
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        {
          ignoreArrowShorthand: true,
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          types: ['boolean'],
          format: ['PascalCase'],
          prefix: ['is', 'are', 'should', 'has', 'can', 'did', 'will'],
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        {
          // Generic type parameter must start with letter T, followed by any uppercase letter.
          selector: 'typeParameter',
          format: ['PascalCase'],
          custom: {
            regex: '^T[A-Z]',
            match: true,
          },
        },
      ],
      'react-hooks/rules-of-hooks': 'error',
      'tsdoc/syntax': 'warn',
    },
  },
)
