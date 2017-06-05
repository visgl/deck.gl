// This file contains webpack configuration settings that allow
// examples to be built against the deck.gl source code in this repo instead
// of building against their installed version of deck.gl.
//
// This enables using the examples to debug the main deck.gl library source
// without publishing or npm linking, with conveniences such hot reloading etc.

// avoid destructuring for older Node version support
const resolve = require('path').resolve;
const webpack = require('webpack');

const LIB_DIR = resolve(__dirname, '..');
const SRC_DIR = resolve(LIB_DIR, './src');

// Support for hot reloading changes to the deck.gl library:
const LOCAL_DEV_CONFIG = {
  // suppress warnings about bundle size
  devServer: {
    stats: {
      warnings: false
    }
  },

  devtool: 'source-map',

  resolve: {
    alias: {
      // Imports the deck.gl library from the src directory in this repo
      'deck.gl': SRC_DIR,
      // Important: ensure shared dependencies come from the main node_modules dir
      'luma.gl': resolve(LIB_DIR, './node_modules/luma.gl'),
      react: resolve(LIB_DIR, './node_modules/react')
    }
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
  },
  // Optional: Enables reading mapbox token from environment variable
  plugins: [
    new webpack.EnvironmentPlugin(['MAPBOX_ACCESS_TOKEN', 'MapboxAccessToken'])
  ]
};

function addLocalDevSettings(config) {
  config = Object.assign({}, LOCAL_DEV_CONFIG, config);
  config.resolve = config.resolve || {};
  config.resolve.alias = config.resolve.alias || {};
  Object.assign(config.resolve.alias, LOCAL_DEV_CONFIG.resolve.alias);

  config.module = config.module || {};
  Object.assign(config.module, {
    rules: (config.module.rules || []).concat(LOCAL_DEV_CONFIG.module.rules)
  });
  return config;
}

module.exports = config => env => {
  if (env && env.local) {
    config = addLocalDevSettings(config);
    // console.warn(JSON.stringify(config, null, 2));
  }

  return config;
};
