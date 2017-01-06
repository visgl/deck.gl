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
      webworkify: 'webworkify-webpack-dropin',
      'gl-matrix': resolve('./node_modules/gl-matrix/dist/gl-matrix.js')
    }
  },

  module: {
    rules: [{
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
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }, {
      // Mapbox has some unresolved fs calls
      include: [resolve('../../dist'), /node_modules\/mapbox-gl/],
      loader: 'transform-loader',
      options: 'brfs'
    }]
  },

  node: {
    fs: 'empty'
  },

  // Allow setting mapbox token using environment variables
  plugins: [
    new webpack.EnvironmentPlugin(['MapboxAccessToken', 'GoogleMapsKey'])
    // new webpack.LoaderOptionsPlugin({minimize: true, debug: false})
  ]
};
