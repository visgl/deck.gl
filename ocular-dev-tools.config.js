const {resolve} = require('path');

const LUMA_ALIASES_LOCAL = {
  'luma.gl': `${__dirname}/../luma.gl/modules/main/src`,
  '@luma.gl/constants': `${__dirname}/../luma.gl/modules/constants/src`,
  '@luma.gl/core': `${__dirname}/../luma.gl/modules/core/src`,
  '@luma.gl/debug': `${__dirname}/../luma.gl/modules/debug/src`,
  '@luma.gl/engine': `${__dirname}/../luma.gl/modules/engine/src`,
  '@luma.gl/webgl': `${__dirname}/../luma.gl/modules/webgl/src`,
  '@luma.gl/gltools': `${__dirname}/../luma.gl/modules/gltools/src`,
  '@luma.gl/shadertools': `${__dirname}/../luma.gl/modules/shadertools/src`,
  '@luma.gl/test-utils': `${__dirname}/../luma.gl/modules/test-utils/src`,
  '@luma.gl/experimental': `${__dirname}/../luma.gl/modules/experimental/src`
};

const useLocalLuma = false;

const config = {
  lint: {
    paths: ['modules', 'examples', 'test'],
    extensions: ['js']
  },

  aliases: {
    'deck.gl-test': resolve(__dirname, './test')
  },

  browserTest: {
    server: {wait: 5000}
  },

  entry: {
    test: 'test/node.js',
    'test-browser': 'test/browser.js',
    bench: 'test/bench/node.js',
    'bench-browser': 'test/bench/browser.js',
    size: 'test/size/import-nothing.js'
  }
};

if (useLocalLuma) {
  Object.assign(config.aliases, LUMA_ALIASES_LOCAL);
}

module.exports = config;
