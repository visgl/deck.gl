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
    'test-rendering': resolve('test-rendering.js')
  },

  // Generate a bundle in dist folder
  output: {
    path: resolve('./dist'),
    filename: '[name]-bundle.js'
  },

  devtool: '#inline-source-maps',

  resolve: {
    alias: {
      'deck.gl': resolve('../../src'),
      '@deck.gl/test-utils': resolve('../../src/test-utils/src'),
      'deck.gl-layers': resolve('../../src/experimental-layers/src')
    }
  },

  module: {
    rules: []
  },

  node: {
    fs: 'empty'
  },

  plugins: []
};
