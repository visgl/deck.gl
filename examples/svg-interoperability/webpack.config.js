const {resolve} = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    app: resolve('./app.js')
  },
  devtool: 'source-maps',
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'buble-loader',
      include: [resolve('.')],
      exclude: [/node_modules/],
      options: {
        objectAssign: 'Object.assign'
      }
    }]
  },
  node: {
    fs: 'empty'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
};
