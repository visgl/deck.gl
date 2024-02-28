/** @typedef {import('ocular-dev-tools').OcularConfig} OcularConfig */
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';

const packageRoot = dirname(fileURLToPath(import.meta.url));
const lumaModules = join(packageRoot, '../luma.gl/modules');

const LUMA_ALIASES_LOCAL = {
  '@luma.gl/constants': `${lumaModules}/constants/src`,
  '@luma.gl/core': `${lumaModules}/core/src`,
  '@luma.gl/engine': `${lumaModules}/engine/src`,
  '@luma.gl/webgl': `${lumaModules}/webgl/src`,
  '@luma.gl/shadertools': `${lumaModules}/shadertools/src`,
  '@luma.gl/test-utils': `${lumaModules}/test-utils/src`,
  '@luma.gl/experimental': `${lumaModules}/experimental/src`
};

const useLocalLuma = false;

/** @type {OcularConfig} */
const config = {
  lint: {
    paths: ['modules', 'test']
    // paths: ['modules', 'test', 'examples', 'website']
  },

  babel: false,

  bundle: {
    globalName: 'deck',
    externals: ['h3-js'],
    target: ['chrome110', 'firefox110', 'safari15'],
    format: 'umd',
    globals: {
      '@deck.gl/*': 'globalThis.deck',
      '@luma.gl/core': 'globalThis.luma',
      '@luma.gl/engine': 'globalThis.luma',
      '@luma.gl/webgl': 'globalThis.luma',
      '@loaders.gl/core': 'globalThis.loaders',
      'h3-js': 'globalThis.h3 || {}'
    }
  },

  typescript: {
    project: 'tsconfig.build.json'
  },

  aliases: {
    'deck.gl-test': join(packageRoot, './test')
  },

  coverage: {
    test: 'browser'
  },

  entry: {
    test: 'test/node.ts',
    'test-browser': 'index.html',
    bench: 'test/bench/index.js',
    'bench-browser': 'test/bench/browser.html',
    size: 'test/size/import-nothing.js'
  }
};

if (useLocalLuma) {
  Object.assign(config.aliases, LUMA_ALIASES_LOCAL);
}

export default config;
