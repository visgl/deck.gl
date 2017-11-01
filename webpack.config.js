const {resolve} = require('path');
const webpack = require('webpack');

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
  externals: [
    /^[a-z\.\-0-9]+$/
  ],

  module: {
    rules: [
      {
        // Inline shaders
        test: /\.glsl$/,
        exclude: /node_modules/,
        loader(content) {
          this.cacheable && this.cacheable(); // eslint-disable-line
          this.value = content;
          return "module.exports = " + JSON.stringify(content); // eslint-disable-line
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

const TEST_BROWSER_CONFIG = {
  devServer: {
    stats: {
      warnings: false
    },
    quiet: true
  },

  // Bundle the tests for running in the browser
  entry: {
    'test-browser': resolve('./test/browser.js')
  },

  // Generate a bundle in dist folder
  output: {
    path: resolve('./dist'),
    filename: '[name]-bundle.js'
  },

  devtool: '#inline-source-maps',

  resolve: {
    alias: {
      'deck.gl/test': resolve('./test'),
      'deck.gl': resolve('./src')
    }
  },

  module: {
    rules: []
  },

  node: {
    fs: 'empty'
  },

  plugins: []
};

const BENCH_BROWSER_CONFIG = Object.assign({}, TEST_BROWSER_CONFIG, {
  entry: {
    'test-browser': resolve('./test/bench/browser.js')
  }
});

// Replace the entry point for webpack-dev-server

BENCH_BROWSER_CONFIG.module.noParse = [
  /benchmark/
];

module.exports = env => {
  env = env || {};
  if (env.bench) {
    return BENCH_BROWSER_CONFIG;
  }
  if (env.test) {
    return TEST_BROWSER_CONFIG;
  }
  return LIBRARY_BUNDLE_CONFIG;
};
