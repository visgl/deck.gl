const {resolve} = require('path');

const LUMA_ALIASES_LOCAL = {
  'luma.gl': `${__dirname}/../luma.gl/modules/main/src`,
  '@luma.gl/constants': `${__dirname}/../luma.gl/modules/constants/src`,
  '@luma.gl/core': `${__dirname}/../luma.gl/modules/core/src`,
  '@luma.gl/debug': `${__dirname}/../luma.gl/modules/debug/src`,
  '@luma.gl/webgl': `${__dirname}/../luma.gl/modules/webgl/src`,
  '@luma.gl/webgl-state-tracker': `${__dirname}/../luma.gl/modules/webgl-state-tracker/src`,
  '@luma.gl/webgl2-polyfill': `${__dirname}/../luma.gl/modules/webgl2-polyfill/src`
};

const useLocalLuma = true;

const config = {
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

if (useLocalLuma) {
  Object.assign(config.aliases, LUMA_ALIASES_LOCAL);
}

module.exports = config;
