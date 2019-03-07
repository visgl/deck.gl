const {resolve} = require('path');

module.exports = {
  babel: {
    plugins: [
      'version-inline',
      [
        'remove-glsl-comments',
        {
          patterns: ['**/*.glsl.js']
        }
      ]
    ]
  },

  lint: {
    paths: ['modules', 'examples', 'test'],
    extensions: ['js']
  },

  aliases: {
    'deck.gl/test': resolve(__dirname, './test')
  },

  entry: {
    'test-node': 'test/modules/index.js',
    'test-browser': 'test/browser.js',
    'bench-node': 'test/bench/index.js',
    'bench-browser': 'test/bench/browser.js',
    size: 'test/size/import-nothing.js'
  }
};
