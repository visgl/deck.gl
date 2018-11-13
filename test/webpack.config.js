const {resolve} = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const ALIASES = require('../aliases')('src');

const LIB_DIR = resolve(__dirname, '..');
const SRC_DIR = resolve(LIB_DIR, './modules');

function makeLocalDevConfig(EXAMPLE_DIR = LIB_DIR) {
  return {
    // TODO - Uncomment when all examples use webpack 4 for faster bundling
    // mode: 'development',

    // suppress warnings about bundle size
    devServer: {
      stats: {
        warnings: false
      }
    },

    devtool: 'source-map',

    resolve: {
      // mainFields: ['esnext', 'module', 'main'],

      alias: Object.assign({}, ALIASES, {
        // Use luma.gl specified by root package.json
        'luma.gl': resolve(LIB_DIR, './node_modules/luma.gl'),
        // Important: ensure shared dependencies come from the main node_modules dir
        // Versions will be controlled by the deck.gl top level package.json
        'math.gl': resolve(LIB_DIR, './node_modules/math.gl'),
        'viewport-mercator-project': resolve(LIB_DIR, './node_modules/viewport-mercator-project'),
        seer: resolve(LIB_DIR, './node_modules/seer'),
        react: resolve(LIB_DIR, './node_modules/react')
      })
    },
    module: {
      rules: [
        {
          // Unfortunately, webpack doesn't import library sourcemaps on its own...
          test: /\.js$/,
          use: ['source-map-loader'],
          enforce: 'pre'
        }
      ]
    }
  };
}

const BUBLE_CONFIG = {
  module: {
    rules: [
      {
        // Compile source using buble
        test: /\.js$/,
        loader: 'buble-loader',
        include: [SRC_DIR],
        options: {
          objectAssign: 'Object.assign',
          transforms: {
            dangerousForOf: true,
            modules: false
          }
        }
      }
    ]
  }
};

const INTERACTION_CONFIG = {
  mode: 'development',

  entry: {
    app: resolve('./app.js')
  },

  output: {
    library: 'App'
  },

  module: {
    rules: [
      {
        // Compile ES2015 using buble
        test: /\.js$/,
        loader: 'buble-loader',
        include: [resolve('.')],
        exclude: [/node_modules/],
        options: {
          objectAssign: 'Object.assign'
        }
      }
    ]
  },

  resolve: {
    alias: {
      // From mapbox-gl-js README. Required for non-browserify bundlers (e.g. webpack):
      'mapbox-gl$': resolve('./node_modules/mapbox-gl/dist/mapbox-gl.js')
    }
  },

  // Optional: Enables reading mapbox token from environment variable
  plugins: [
    // new HtmlWebpackPlugin({title: 'deck.gl example'})
    new HtmlWebpackPlugin(),
    new webpack.EnvironmentPlugin(['MapboxAccessToken'])
  ]
};

function addLocalDevSettings(config, exampleDir) {
  const LOCAL_DEV_CONFIG = makeLocalDevConfig(exampleDir);
  config = Object.assign({}, LOCAL_DEV_CONFIG, config);
  config.resolve = Object.assign({}, LOCAL_DEV_CONFIG.resolve, config.resolve || {});
  config.resolve.alias = config.resolve.alias || {};
  Object.assign(config.resolve.alias, LOCAL_DEV_CONFIG.resolve.alias);

  config.module = config.module || {};
  Object.assign(config.module, {
    rules: (config.module.rules || []).concat(LOCAL_DEV_CONFIG.module.rules)
  });
  return config;
}

function addBubleSettings(config) {
  config.module = config.module || {};
  Object.assign(config.module, {
    rules: (config.module.rules || []).concat(BUBLE_CONFIG.module.rules)
  });
  return config;
}

function getInteractionConfig(env) {
  // npm run start-local now transpiles the lib
  let config = Object.assign({}, INTERACTION_CONFIG);
  if (env && env.interaction) {
    config = addLocalDevSettings(config);
    config = addBubleSettings(config);
  }

  // npm run start-es6 does not transpile the lib
  if (env && env.es6) {
    config = addLocalDevSettings(config);
  }

  if (env && env.production) {
    config.mode = 'production';
  }

  // console.warn(JSON.stringify(config, null, 2)); // uncomment to debug config
  return config;
}

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

  interaction: env => Object.assign({}, getInteractionConfig(env)),

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
