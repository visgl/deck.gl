const {resolve} = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    app: resolve('./app.js')
  },

  devtool: 'source-maps',

  module: {
    rules: [{
      // Compile ES2015 using buble
      test: /\.js$/,
      loader: 'buble-loader',
      include: resolve('./app.js'),
      options: {
        objectAssign: 'Object.assign'
      }
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }, {
      // Mapbox has some unresolved fs calls
      include: /node_modules\/mapbox-gl/,
      loader: 'transform-loader',
      options: 'brfs'
    }]
  },

  resolve: {
    alias: {
      webworkify: 'webworkify-webpack-dropin',
      // Uncommenting this, the build still works but is 400K bigger...
      'gl-matrix': resolve('./node_modules/gl-matrix/dist/gl-matrix.js')
    }
  },

  node: {
    fs: 'empty'
  },

  // Allow setting mapbox token using environment variables
  plugins: [
    new webpack.EnvironmentPlugin(['MAPBOX_ACCESS_TOKEN', 'MapboxAccessToken']),
    // TODO - doesn't eseem to have any effect
    new webpack.LoaderOptionsPlugin({minimize: true, debug: false})
  ]
};
