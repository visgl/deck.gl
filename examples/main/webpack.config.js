// NOTE: To use this example standalone (e.g. outside of deck.gl repo)
// delete the local development overrides at the bottom of this file
const {resolve} = require('path');
const webpack = require('webpack');

module.exports = {
  // bundle app.js and everything it imports, recursively.
  entry: {
    app: resolve('./app.js')
  },

  // inline source maps seem to work best
  devtool: '#inline-source-map',

  resolve: {
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

  // Optional: Enables reading mapbox token from environment variable
  plugins: [
    new webpack.EnvironmentPlugin(['MAPBOX_ACCESS_TOKEN', 'MapboxAccessToken'])
  ]
};

// DELETE THIS LINE WHEN COPYING THIS EXAMPLE FOLDER OUTSIDE OF DECK.GL
// It enables bundling against src in this repo rather than installed deck.gl module
module.exports = require('../webpack.config.local')(module.exports);
