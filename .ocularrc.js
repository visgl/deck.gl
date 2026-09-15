/** @typedef {import('@vis.gl/dev-tools').OcularConfig} OcularConfig */
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

// Optional Node.js codecs referenced by loaders.gl through dynamic imports. Keep them out of
// browser bundles; applications that need these codecs can install and import them separately.
const LOADERS_OPTIONAL_EXTERNALS = [
  '@loaders.gl/geoarrow',
  'module',
  'compress-utils/brotli/compress',
  'compress-utils/brotli/decompress',
  'compress-utils/bz2/compress',
  'compress-utils/bz2/decompress',
  'compress-utils/gzip/compress',
  'compress-utils/gzip/decompress',
  'compress-utils/lz4/compress',
  'compress-utils/lz4/decompress',
  'compress-utils/snappy/compress',
  'compress-utils/snappy/decompress',
  'compress-utils/xz/compress',
  'compress-utils/xz/decompress',
  'compress-utils/zlib/compress',
  'compress-utils/zlib/decompress',
  'compress-utils/zstd/compress',
  'compress-utils/zstd/decompress'
];

/** @type {OcularConfig} */
const config = {
  lint: {
    paths: ['modules', 'test', 'examples']
    // paths: ['modules', 'test', 'examples', 'website']
  },

  babel: false,

  bundle: {
    globalName: 'deck',
    externals: ['h3-js', ...LOADERS_OPTIONAL_EXTERNALS],
    target: ['chrome110', 'firefox110', 'safari15'],
    format: 'umd',
    globals: {
      '@deck.gl/*': 'globalThis.deck',
      '@luma.gl/core': 'globalThis.luma',
      '@luma.gl/engine': 'globalThis.luma',
      '@loaders.gl/core': 'globalThis.loaders',
      '@loaders.gl/geoarrow': '{}',
      'compress-utils/': '{}',
      module: '{}',
      'h3-js': 'globalThis.h3 || {}'
    }
  },

  aliases: {
    'deck.gl-test': join(packageRoot, './test')
  },

  coverage: {
    test: 'browser'
  },

  entry: {
    // TODO: Migrate bench and size to vitest (Phase 7)
    bench: 'test/bench/index.js',
    'bench-browser': 'test/bench/browser.html',
    size: 'test/size/import-nothing.js'
  }
};

if (useLocalLuma) {
  Object.assign(config.aliases, LUMA_ALIASES_LOCAL);
}

export default config;
