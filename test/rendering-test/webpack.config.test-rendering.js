// This is a Webpack 2 configuration file
const {resolve} = require('path');
// const webpack = require('webpack');

module.exports = {
  devServer: {
    stats: {
      warnings: false
    },
    quiet: true
  },

  // Bundle the tests for running in the browser
  entry: {
    'test-rendering': resolve('rendering-test/rendering-test.js')
  },

  // Generate a bundle in dist folder
  output: {
    path: resolve('./dist'),
    filename: '[name]-bundle.js'
  },

  devtool: '#inline-source-maps',

  resolve: {
    alias: {
      'deck.gl': resolve('./src')
    }
  },

  module: {
    rules: [
      {
        // Mapbox has some unresolved fs calls
        include: [resolve('./src')],
        loader: 'transform-loader',
        options: 'brfs-babel'
      }
    ]
  },

  node: {
    fs: 'empty'
  },

  plugins: []
};
