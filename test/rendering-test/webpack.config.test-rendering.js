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
    'test-rendering': resolve('rendering.spec.js')
  },

  // Generate a bundle in dist folder
  output: {
    path: resolve('./dist'),
    filename: '[name]-bundle.js'
  },

  devtool: '#inline-source-maps',

  resolve: {
    alias: {
      'deck.gl': resolve('../../src')
    }
  },

  module: {
    rules: [
      {
        include: [resolve('../../src')],
        loader: 'transform-loader',
        options: 'brfs-babel'
      },
      {
        test: /\.glsl$/,
        use: 'raw-loader'
      },
      {
      // Compile ES2015 using buble
        test: /\.js$/,
        loader: 'buble-loader',
        include: resolve('./rendering.spec.js'),
        options: {
          objectAssign: 'Object.assign'
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

  plugins: []
};
