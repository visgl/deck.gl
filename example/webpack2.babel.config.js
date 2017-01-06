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
      'gl-matrix': resolve('./node_modules/gl-matrix/dist/gl-matrix.js'),
      // Work against base library
      'deck.gl': resolve('../dist'),
      // Using our dependencies
      'luma.gl': resolve('./node_modules/luma.gl'),
      'viewport-mercator-project': resolve('./node_modules/viewport-mercator-project'),
      react: resolve('./node_modules/react'),
      'autobind-decorator': resolve('./node_modules/autobind-decorator'),
      'brfs': resolve('./node_modules/brfs'),
      'lodash.flattendeep': resolve('./node_modules/lodash.flattendeep'),
      'earcut': resolve('./node_modules/earcut'),
      'geojson-normalize': resolve('./node_modules/geojson-normalize'),
    }
  },

  module: {
    rules: [{
      test: /\.json$/,
      loader: 'json-loader'
    }, {
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: [/node_modules/, /dist/],
      // include: resolve('./app.js'),
      options: {
        presets: ['es2015', 'stage-2', 'react']
      }
    }, {
      include: [resolve('../dist'), /node_modules\/mapbox-gl/],
      loader: 'transform-loader',
      query: 'brfs'
    }]
  },

  node: {
    fs: 'empty'
  },

  // Allow setting mapbox token using environment variables
  plugins: [
    new webpack.EnvironmentPlugin(['MAPBOX_ACCESS_TOKEN', 'MapboxAccessToken']),
    // TODO - does not seem to have any effect
    // new webpack.LoaderOptionsPlugin({minimize: true, debug: false})
  ]
};