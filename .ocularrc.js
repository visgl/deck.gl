const {resolve, join} = require('path');

const packageRoot = resolve(__dirname);
const nodeModules = join(packageRoot, 'node_modules');
const lumaModules = join(packageRoot, '../luma.gl/modules');

const LUMA_ALIASES_LOCAL = {
  'luma.gl': `${lumaModules}/main/src`,
  '@luma.gl/constants': `${lumaModules}/constants/src`,
  '@luma.gl/core': `${lumaModules}/core/src`,
  '@luma.gl/debug': `${lumaModules}/debug/src`,
  '@luma.gl/engine': `${lumaModules}/engine/src`,
  '@luma.gl/webgl': `${lumaModules}/webgl/src`,
  '@luma.gl/gltools': `${lumaModules}/gltools/src`,
  '@luma.gl/shadertools': `${lumaModules}/shadertools/src`,
  '@luma.gl/test-utils': `${lumaModules}/test-utils/src`,
  '@luma.gl/experimental': `${lumaModules}/experimental/src`
};

const useLocalLuma = false;

const config = {
  lint: {
    paths: ['modules', 'test']
    // paths: ['modules', 'test', 'examples', 'website']
  },

  bundle: {
    globalName: 'deck',
    externals: ['h3-js'],
    target: ['supports webgl', 'not dead'],
    format: 'umd',
    globals: {
      '@deck.gl/*': 'globalThis.deck',
      '@luma.gl/core': 'globalThis.luma',
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

  // These packages are of type: 'module' and do not work in node tests when compiled to commonjs
  // ts-node has experimental ESM support, but there's no reliable module aliasing
  // See https://github.com/dividab/tsconfig-paths/issues/122
  nodeAliases: {
    '@jupyter-widgets/base': `${packageRoot}/test/modules/jupyter-widget/dummy-jupyter-widgets-base.js`,
    '@mapbox/tiny-sdf': `${nodeModules}/@mapbox/tiny-sdf/index.cjs`,
    'd3-array': `${nodeModules}/d3-array/dist/d3-array.cjs`,
    'd3-color': `${nodeModules}/d3-color/dist/d3-color.cjs`,
    'd3-format': `${nodeModules}/d3-format/dist/d3-format.cjs`,
    'd3-interpolate': `${nodeModules}/d3-interpolate/dist/d3-interpolate.cjs`,
    'd3-scale': `${nodeModules}/d3-scale/dist/d3-scale.cjs`,
    'd3-time': `${nodeModules}/d3-time/dist/d3-time.cjs`,
    'd3-time-format': `${nodeModules}/d3-time-format/dist/d3-time-format.cjs`,
    'mapbox-gl': `${packageRoot}/test/modules/jupyter-widget/dummy-mapbox-gl.js`,
    'react-map-gl/dist/esm/mapbox/mapbox': `${nodeModules}/react-map-gl/dist/es5/mapbox/mapbox.js`
  },

  browserTest: {
    server: {wait: 5000}
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

module.exports = config;
