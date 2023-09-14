const {getESLintConfig} = require('ocular-dev-tools/configuration');

module.exports = getESLintConfig({
  react: '18.0.0',
  overrides: {
    parserOptions: {
      project: ['./tsconfig.json'],
      ecmaVersion: 2020
    },
    extends: ['prettier'],

    env: {
      es2020: true
      // browser: true,
      // node: true
    },

    globals: {
      Iterable: true,
      AsyncIterable: true
    },

    rules: {
      camelcase: 0,
      indent: 0,
      'import/no-unresolved': 0,
      'import/no-extraneous-dependencies': 0, // ['warn'],
      'no-console': 1,
      'no-continue': ['warn'],
      'callback-return': 0,
      'max-depth': ['warn', 4],
      complexity: ['warn'],
      'max-statements': ['warn'],
      'default-case': ['warn'],
      'no-eq-null': ['warn'],
      eqeqeq: ['warn'],
      radix: 0,
      'react/sort-comp': 0
      // 'accessor-pairs': ['error', {getWithoutSet: false, setWithoutGet: false}]
    },

    overrides: [
      {
        files: ['**/*.ts', '**/*.tsx', '**/*.d.ts'],
        rules: {
          indent: 0,
          // For parquet module
          '@typescript-eslint/no-non-null-assertion': 0,
          '@typescript-eslint/no-non-null-asserted-optional-chain': 0,
          // Gradually enable
          '@typescript-eslint/ban-ts-comment': 0,
          '@typescript-eslint/ban-types': 0,
          '@typescript-eslint/no-unsafe-member-access': 0,
          '@typescript-eslint/no-unsafe-assignment': 0,
          '@typescript-eslint/no-var-requires': 0,
          '@typescript-eslint/no-unused-vars': [
            'warn',
            {vars: 'all', args: 'none', ignoreRestSiblings: false}
          ],
          // We still have some issues with import resolution
          'import/named': 0,
          // Warn instead of error
          // 'max-params': ['warn'],
          // 'no-undef': ['warn'],
          // camelcase: ['warn'],
          // '@typescript-eslint/no-floating-promises': ['warn'],
          // '@typescript-eslint/await-thenable': ['warn'],
          // '@typescript-eslint/no-misused-promises': ['warn'],
          '@typescript-eslint/no-empty-function': ['warn', {allow: ['arrowFunctions']}],
          // We use function hoisting
          '@typescript-eslint/no-use-before-define': 0,
          // We always want explicit typing, e.g `field: string = ''`
          '@typescript-eslint/no-inferrable-types': 0,
          '@typescript-eslint/restrict-template-expressions': 0,
          '@typescript-eslint/explicit-module-boundary-types': 0,
          '@typescript-eslint/require-await': 0,
          '@typescript-eslint/no-unsafe-return': 0,
          '@typescript-eslint/no-unsafe-call': 0,
          '@typescript-eslint/no-empty-interface': 0,
          '@typescript-eslint/restrict-plus-operands': 0
        }
      },
      // tests are run with aliases set up in node and webpack.
      // This means lint will not find the imported files and generate false warnings
      {
        // scripts use devDependencies
        files: [
          '**/test/**/*.js',
          '**/test/**/*.ts',
          '**/scripts/**/*.js',
          '*.config.js',
          '*.config.local.js',
          '*.config.local.mjs'
        ],
        globals: {
          process: true
        },
        rules: {
          'import/no-unresolved': 0,
          'import/no-extraneous-dependencies': 0,
          'no-process-env': 0
        }
      },
      {
        files: ['examples/**/*.*', 'website/src/**/*.*'],
        rules: {
          // We want lint to pass without having to install the dependencies for examples or website
          'import/no-unresolved': 0,
          'import/named': 0,
          'no-new': 0
        }
      }
    ],

    settings: {
      // Ensure eslint finds typescript files
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.mjs', '.ts', '.tsx']
        }
      }
    }
  }
});
