const {resolve} = require('path');

module.exports = {
  lint: {
    paths: ['modules', 'examples', 'test'],
    extensions: ['js']
  },

  aliases: {
    'deck.gl-test': resolve(__dirname, './test')
  },

  entry: {
    test: 'test/modules/index.js',
    'test-browser': 'test/browser.js',
    bench: 'test/bench/index.js',
    'bench-browser': 'test/bench/browser.js',
    size: 'test/size/import-nothing.js'
  }
};
