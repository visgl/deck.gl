// NOTE: To use this example standalone (e.g. outside of deck.gl repo)
// delete the local development overrides at the bottom of this file

// avoid destructuring for older Node version support
const resolve = require('path').resolve;
const webpack = require('webpack');

const CONFIG = {
  // bundle app.js and everything it imports, recursively.
  entry: {
    app: resolve('./src/app.js')
  },

  devtool: 'source-map',

  resolve: {
    // Make src files outside of this dir resolve modules in our node_modules folder
    modules: [resolve(__dirname, '.'), resolve(__dirname, 'node_modules'), 'node_modules'],
    alias: {
      // From mapbox-gl-js README. Required for non-browserify bundlers (e.g. webpack):
      'mapbox-gl$': resolve('./node_modules/mapbox-gl/dist/mapbox-gl.js')
    }
  },

  module: {
    rules: [
      {
        // Transpile ES6 to ES5 with buble
        // Remove if your app does not use JSX or you don't need to support old browsers
        test: /\.js$/,
        loader: 'buble-loader',
        exclude: [/node_modules/],
        options: {
          objectAssign: 'Object.assign', // Note: may need polyfill on old browsers
          transforms: {
            modules: false,      // Let Webpack take care of import/exports
            dangerousForOf: true // Use for/of in spite of buble's limitations
          }
        }
      },
      {
        // The example has some JSON data
        test: /\.json$/,
        loader: 'json-loader',
        exclude: [/node_modules/]
      }
    ]
  },

  node: {
    fs: 'empty'
  },

  // Optional: Enables reading mapbox token from environment variable
  plugins: [
    new webpack.EnvironmentPlugin(['MapboxAccessToken'])
  ]
};

// This line enables bundling against src in this repo rather than installed deck.gl module
module.exports = env => env ? require('../webpack.config.local')(CONFIG)(env) : CONFIG;
