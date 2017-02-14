const {resolve} = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    app: resolve('./app.js')
  },

  devtool: 'source-maps',

  resolve: {
    alias: {
      // mapbox-gl config
      // webworkify: 'webworkify-webpack-dropin'
      // 'gl-matrix': resolve('./node_modules/gl-matrix/dist/gl-matrix.js'),
      // // Work against base library
      // 'deck.gl': resolve('../../dist/lib-bundle.js'),
      // // Using our dependencies
      // 'luma.gl': resolve('./node_modules/luma.gl'),
      // 'viewport-mercator-project': resolve('./node_modules/viewport-mercator-project'),
      // react: resolve('./node_modules/react'),
      // 'autobind-decorator': resolve('./node_modules/autobind-decorator'),
      // brfs: resolve('./node_modules/brfs'),
      // earcut: resolve('./node_modules/earcut'),
      // 'geojson-normalize': resolve('./node_modules/geojson-normalize'),
      // 'lodash.flattendeep': resolve('./node_modules/lodash.flattendeep')
    }
  },

  module: {
    rules: [
      {
        // Compile ES2015 using buble
        test: /\.js$/,
        loader: 'buble-loader',
        exclude: [/node_modules/, /dist/],
        options: {
          objectAssign: 'Object.assign',
          transforms: {
            dangerousForOf: true,
            modules: false
          }
        }
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },

  node: {
    fs: 'empty'
  },

  // Allow setting mapbox token using environment variables
  plugins: [
    new webpack.EnvironmentPlugin(['MAPBOX_ACCESS_TOKEN', 'MapboxAccessToken'])
    // new webpack.LoaderOptionsPlugin({minimize: true, debug: false})
  ]
};

// DELETE THIS LINE WHEN COPYING THIS EXAMPLE FOLDER OUTSIDE OF DECK.GL
// It enables bundling against src in this repo rather than installed deck.gl module
module.exports = require('../webpack.config.local')(module.exports);
