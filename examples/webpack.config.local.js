// This file contains webpack configuration settings that allow
// examples to be built against the deck.gl source code in this repo instead
// of building against their installed version of deck.gl.
//
// This enables using the examples to debug the main deck.gl library source
// without publishing or npm linking, with conveniences such hot reloading etc.

const {resolve} = require('path');
const webpack = require('webpack');

const LIB_DIR = resolve(__dirname, '..');
const SRC_DIR = resolve(LIB_DIR, './src');

// Support for hot reloading changes to the deck.gl library:
const LOCAL_DEVELOPMENT_CONFIG = {
  // suppress warnings about bundle size
  devServer: {
    stats: {
      warnings: false
    }
  },

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
        // Inline shaders
        test: /\.glsl$/,
        loader: 'raw-loader',
        exclude: [/node_modules/]
      }
    ]
  },
  // Optional: Enables reading mapbox token from environment variable
  plugins: [
    new webpack.EnvironmentPlugin(['MAPBOX_ACCESS_TOKEN', 'MapboxAccessToken'])
  ]
};

function addLocalDevSettings(config) {
  Object.assign(config.resolve.alias, LOCAL_DEVELOPMENT_CONFIG.resolve.alias);
  config.module.rules = config.module.rules.concat(LOCAL_DEVELOPMENT_CONFIG.module.rules);
  return config;
}

module.exports = baseConfig => env => {
  const config = baseConfig;
  if (env && env.local) {
    addLocalDevSettings(config);
  }
  // console.log(JSON.stringify(config, null, 2));
  return config;
};
