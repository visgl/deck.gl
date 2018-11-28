const {resolve} = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const ALIASES = require('../aliases')('src');

const TEST_CONFIG = {
  mode: 'development',

  devServer: {
    stats: {
      warnings: false
    },
    quiet: true
  },

  // Generate a bundle in dist folder
  output: {
    path: resolve('./dist'),
    filename: 'bundle.js'
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

  plugins: [new HtmlWebpackPlugin({title: 'deck.gl tests'})]
};

// Get first key in an object
function getFirstKey(object) {
  for (const key in object) {
    return key;
  }
  return null;
}

// Hack: first key is app
function getApp(env) {
  return getFirstKey(env);
}

function getDist(env) {
  if (env.esm) {
    return 'esm';
  }
  if (env.es5) {
    return 'es5';
  }
  return 'es6';
}

const CONFIGS = {
  test: env =>
    Object.assign({}, TEST_CONFIG, {
      // Bundle the tests for running in the browser
      entry: {
        'test-browser': resolve('./test/test-browser.js')
      }
      // plugins: [new HtmlWebpackPlugin()]
    }),

  bench: env =>
    Object.assign({}, TEST_CONFIG, {
      entry: {
        'test-browser': resolve('./test/bench/browser.js')
      },
      plugins: [new HtmlWebpackPlugin()]
    }),

  render: env =>
    Object.assign({}, TEST_CONFIG, {
      // Bundle the tests for running in the browser
      entry: {
        'test-browser': resolve('./test/render/test-rendering.js')
      },
      plugins: [new HtmlWebpackPlugin()]
    }),

  renderReact: env =>
    Object.assign({}, TEST_CONFIG, {
      // Bundle the tests for running in the browser
      entry: {
        'test-browser': resolve('./test/render/old/test-rendering.react.js')
      },
      plugins: [new HtmlWebpackPlugin()]
    }),

  interaction: env =>
    Object.assign({}, TEST_CONFIG, {
      entry: {
        app: resolve('./app.js')
      },
      output: {
        library: 'App',
        filename: 'app.js'
      },
      plugins: [new HtmlWebpackPlugin()]
    }),

  size: env => {
    const dist = getDist(env);

    const config = Object.assign({}, TEST_CONFIG, {
      resolve: {
        alias: ALIASES
      }
    });
    if (dist === 'es6') {
      resolve.mainFields = ['esnext', 'browser', 'module', 'main'];
    }
    if (dist === 'es5') {
      resolve.mainFields = ['main'];
    }
    return config;
  },

  bundle: env => {
    const app = getApp(env);

    const config = CONFIGS.size(env);

    Object.assign(config, {
      mode: 'production',

      // Replace the entry point for webpack-dev-server
      entry: {
        'test-browser': resolve(__dirname, './size', `${app}.js`)
      },
      output: {
        path: resolve('/tmp'),
        filename: 'bundle.js'
      },
      resolve: {
        alias: ALIASES
      },
      plugins: [
        // leave minification to app
        // new webpack.optimize.UglifyJsPlugin({comments: false})
        new webpack.DefinePlugin({NODE_ENV: JSON.stringify('production')})
      ]
    });

    const dist = getDist(env);
    if (dist === 'es6') {
      config.resolve.mainFields = ['esnext', 'browser', 'module', 'main'];
    }
    if (dist === 'es5') {
      config.resolve.mainFields = ['main'];
    }

    delete config.devtool;
    return config;
  },

  // Bundles a test app for size analysis and starts the webpack bundle analyzer
  analyze: env => {
    const config = CONFIGS.bundle(env);
    config.plugins.push(new BundleAnalyzerPlugin());
    return config;
  }
};

// Pick a webpack config based on --env.*** argument to webpack
function getConfig(env) {
  if (env.test || env.testBrowser || env.test_browser) {
    return CONFIGS.test(env);
  }
  if (env.render) {
    return CONFIGS.render(env);
  }
  if (env.renderReact || env.render_react) {
    return CONFIGS.renderReact(env);
  }
  if (env.bench) {
    return CONFIGS.bench(env);
  }
  if (env.analyze) {
    return CONFIGS.analyze(env);
  }
  if (env.interaction) {
    return CONFIGS.interaction(env);
  }
  return CONFIGS.bundle(env);
}

module.exports = (env = {}) => {
  // env = getEnv(env);
  // NOTE uncomment to display env
  // console.log('webpack env', JSON.stringify(env));

  const config = getConfig(env);
  // NOTE uncomment to display config
  // console.log('webpack config', JSON.stringify(config));

  return config;
};
