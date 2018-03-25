const {resolve} = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const ALIASES = require('../aliases');

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

  module: {
    rules: []
  },

  node: {
    fs: 'empty'
  },

  plugins: [
    // leave minification to app
    // new webpack.optimize.UglifyJsPlugin({comments: false})
    new webpack.DefinePlugin({
      DECK_VERSION: JSON.stringify(require('../package.json').version),
      NODE_ENV: 'production'
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
    alias: Object.assign({}, ALIASES, {
      // Aliases needed to defeat root scripts from getting duplicate dependencies
      // from sub module node_modules
      'luma.gl': resolve('./node_modules/luma.gl'),
      'probe.gl': resolve('./node_modules/probe.gl')
    })
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

  plugins: [new HtmlWebpackPlugin({title: 'luma.gl tests'})]
};

const TEST_BROWSER_CONFIG = Object.assign({}, BROWSER_CONFIG, {
  // Bundle the tests for running in the browser
  entry: {
    'test-browser': resolve('./test/test-browser.js')
  }
});

const RENDER_BROWSER_CONFIG = Object.assign({}, BROWSER_CONFIG, {
  // Bundle the tests for running in the browser
  entry: {
    'test-browser': resolve('./test/render/test-rendering.js')
  }
});

// TODO - remove this target once above target is solid
const RENDER_REACT_BROWSER_CONFIG = Object.assign({}, BROWSER_CONFIG, {
  // Bundle the tests for running in the browser
  entry: {
    'test-browser': resolve('./test/render/old/test-rendering.react.js')
  }
});

const BENCH_BROWSER_CONFIG = Object.assign({}, BROWSER_CONFIG, {
  entry: {
    'test-browser': resolve('./test/bench/browser.js')
  }
});

const SIZE_ES6_CONFIG = Object.assign({}, TEST_BROWSER_CONFIG, {
  resolve: {
    mainFields: ['esnext', 'browser', 'module', 'main'],
    alias: Object.assign({}, ALIASES, {
      'deck.gl': resolve(__dirname, '../dist/es6')
    })
  }
});

const SIZE_ESM_CONFIG = Object.assign({}, TEST_BROWSER_CONFIG, {
  resolve: {
    alias: Object.assign({}, ALIASES, {
      'deck.gl': resolve(__dirname, '../dist/esm')
    })
  }
});

// Get first key in an object
function getFirstKey(object) {
  for (const key in object) {
    return key;
  }
  return null;
}

// Bundles a test app for size analysis
function getBundleConfig(env) {
  const app = getFirstKey(env);

  const config = Object.assign({}, env.es6 ? SIZE_ES6_CONFIG : SIZE_ESM_CONFIG, {
    // Replace the entry point for webpack-dev-server
    entry: {
      'test-browser': resolve(__dirname, './size', `${app}.js`)
    },
    output: {
      path: resolve('/tmp'),
      filename: 'bundle.js'
    },
    plugins: [
      // leave minification to app
      // new webpack.optimize.UglifyJsPlugin({comments: false})
      new webpack.DefinePlugin({NODE_ENV: JSON.stringify('production')}),
      new UglifyJsPlugin()
    ]
  });

  delete config.devtool;
  return config;
}

// Bundles a test app for size analysis and starts the webpack bundle analyzer
function getBundleSizeAnalyzerConfig(env) {
  const config = getBundleConfig(env);
  config.plugins.push(new BundleAnalyzerPlugin());
}

// Pick a webpack config based on --env.*** argument to webpack
function getConfig(env) {
  if (env.test || env['test-browser']) {
    return TEST_BROWSER_CONFIG;
  }
  if (env.render) {
    return RENDER_BROWSER_CONFIG;
  }
  if (env['render-react']) {
    return RENDER_REACT_BROWSER_CONFIG;
  }
  if (env.bench) {
    return BENCH_BROWSER_CONFIG;
  }

  if (env.lib) {
    // not used
    return LIBRARY_BUNDLE_CONFIG;
  }

  if (env.bundle) {
    // not used
    return getBundleConfig(env);
  }

  return getBundleSizeAnalyzerConfig(env);
}

module.exports = env => {
  const config = getConfig(env || {});
  // NOTE uncomment to display config
  // console.log('webpack env', JSON.stringify(env));
  // console.log('webpack config', JSON.stringify(config));
  return config;
};
