// NOTE: To use this example standalone (e.g. outside of deck.gl repo)
// delete the local development overrides at the bottom of this file

// avoid destructuring for older Node version support
const resolve = require('path').resolve;
const webpack = require('webpack');

const config = {
  entry: {
    app: resolve('./src/root.js')
  },

  devtool: 'source-map',

  module: {
    rules: [
      {
        // Compile ES2015 using bable
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
      // 'mapbox-gl$': resolve('./node_modules/mapbox-gl/dist/mapbox-gl.js')
      // 'mapbox-gl$': resolve('../../../mapbox-gl-js/dist/mapbox-gl-dev.js')
      'mapbox-gl$': resolve('./node_modules/mapbox-gl/dist/mapbox-gl.js')
    }
  },

  // Optional: Enables reading mapbox token from environment variable
  plugins: [new webpack.EnvironmentPlugin(['MapboxAccessToken'])]
};

// Enables bundling against src in this repo rather than the installed version
module.exports = env =>
  env && env.local ? require('../../webpack.config.local')(config)(env) : config;
