const {resolve} = require('path');
const webpack = require('webpack');

const ALIASES = require('../../aliases');

const LIBRARY_BUNDLE_CONFIG = {
  // Bundle the source code
  entry: {
    lib: resolve('./src/index.js')
  },

  // Silence warnings about big bundles
  stats: {
    warnings: false
  },

  output: {
    // Generate the bundle in dist folder
    path: resolve('./dist'),
    filename: '[name]-bundle.js',
    library: 'deck.gl',
    libraryTarget: 'umd'
  },

  // Exclude any non-relative imports from resulting bundle
  externals: [/^[a-z\.\-0-9]+$/],

  resolve: {
    alias: ALIASES
  },

  module: {
    rules: [
      {
        // Inline shaders
        test: /\.glsl$/,
        exclude: /node_modules/,
        loader(content) {
          this.cacheable && this.cacheable(); // eslint-disable-line
          this.value = content;
          return 'module.exports = ' + JSON.stringify(content); // eslint-disable-line
        }
      }
    ]
  },

  node: {
    fs: 'empty'
  },

  plugins: [
    // leave minification to app
    // new webpack.optimize.UglifyJsPlugin({comments: false})
    new webpack.DefinePlugin({
      DECK_VERSION: JSON.stringify(require('./package.json').version)
    })
  ]
};

const BROWSER_CONFIG = {
  devServer: {
    stats: {
      warnings: false
    },
    quiet: true
  },

  // Generate a bundle in dist folder
  output: {
    path: resolve('./dist'),
    filename: '[name]-bundle.js'
  },

  resolve: {
    alias: ALIASES
  },

  devtool: '#inline-source-maps',

  module: {
    rules: [
      {
        // Unfortunately, webpack doesn't import library sourcemaps on its own...
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre'
      }
    ]
  },

  node: {
    fs: 'empty'
  },

  plugins: []
};

const TEST_BROWSER_CONFIG = Object.assign({}, BROWSER_CONFIG, {
  // Bundle the tests for running in the browser
  entry: {
    'test-browser': resolve('./test/browser.js')
  }
});

const RENDER_BROWSER_CONFIG = Object.assign({}, BROWSER_CONFIG, {
  // Bundle the tests for running in the browser
  entry: {
    'test-browser': resolve('./test/render-test.spec.js')
  }
});

const BENCH_BROWSER_CONFIG = Object.assign({}, BROWSER_CONFIG, {
  entry: {
    'test-browser': resolve('./test/bench/browser.js')
  }
});

module.exports = env => {
  env = env || {};
  let config = LIBRARY_BUNDLE_CONFIG;
  if (env.test) {
    config = TEST_BROWSER_CONFIG;
  }
  if (env.render) {
    config = RENDER_BROWSER_CONFIG;
  }
  if (env.bench) {
    config = BENCH_BROWSER_CONFIG;
  }
  return config;
};
