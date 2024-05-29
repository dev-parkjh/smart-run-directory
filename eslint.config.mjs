import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'

export default [
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // error
      'no-eval': 'error',

      // warn
      semi: ['warn', 'never'],
      quotes: ['warn', 'single'],
      eqeqeq: ['warn', 'always'],
      indent: ['warn', 2],
      'rest-spread-spacing': ['warn', 'never'],
      'space-infix-ops': 'warn',
      'func-style': ['warn', 'expression'],
      'no-unneeded-ternary': 'warn',
      'padding-line-between-statements': [
        'warn',
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: 'directive', next: '*' },
        { blankLine: 'any', prev: 'directive', next: 'directive' }
      ],
      'space-before-function-paren': ['warn', 'never'],
      'keyword-spacing': ['warn', { before: true, after: true }],
      'eol-last': ['warn', 'always'],
      'no-multiple-empty-lines': ['warn', { max: 2 }],
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'parameter',
          format: [
            'camelCase'
          ],
          leadingUnderscore: 'allow'
        }
      ],
    }
  }
]
