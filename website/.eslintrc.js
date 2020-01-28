// prettier-ignore
module.exports = {
  plugins: ['react'],
  parser: 'babel-eslint',
  extends: ['uber-jsx', 'uber-es2015', 'prettier', 'prettier/react', 'plugin:import/errors'],
  overrides: [{
    files: ['*.spec.js', 'webpack.config.js', '**/bundle/*.js'],
    rules: {
      'import/no-extraneous-dependencies': 0
    }
  }],
  settings: {
    'import/core-modules': [
      'deck.gl'
    ]
  },
  rules: {
    'guard-for-in': 0,
    'no-inline-comments': 0,
    camelcase: 0,
    'react/forbid-prop-types': 0,
    'react/no-deprecated': 0,
    'import/no-unresolved': ['error', {ignore: ['test']}],
    'import/no-extraneous-dependencies': ['error', {devDependencies: false, peerDependencies: true}]
  },
  parserOptions: {
    ecmaVersion: 2018
  }
};
