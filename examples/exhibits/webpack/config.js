const {resolve} = require('path');

module.exports = {

  entry: [
    resolve('../app.js'),
    'webpack/hot/dev-server',
    'webpack-dev-server/client?http://localhost:3000',
  ],

  devtool: 'source-maps',

  resolve: {
    alias: {
      webworkify: 'webworkify-webpack-dropin',
      'gl-matrix': resolve('./node_modules/gl-matrix/dist/gl-matrix.js'),
    },
  },

  module: {

    loaders: [{
      test: /\.json$/,
      loader: 'json-loader',
    }, {
      test: /\.js$/,
      loader: 'babel-loader',
      include: resolve('../app.js'),
    }],

    postLoaders: [{
      include: /node_modules\/mapbox-gl/,
      loader: 'transform-loader',
      query: 'brfs',
    }],

  },

  node: {
    fs: 'empty',
  },

};
