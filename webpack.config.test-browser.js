// Webpack 2 configuration file for running tests in browser
const {resolve} = require('path');

module.exports = {
  devServer: {
    stats: {
      warnings: false
    },
    quiet: true
  },

  // Bundle the tests for running in the browser
  entry: {
    'test-browser': resolve('./test/browser.js')
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
        // Compile ES2015 using buble
        test: /\.js$/,
        loader: 'buble-loader',
        include: [/src/],
        options: {
          objectAssign: 'Object.assign',
          transforms: {
            dangerousForOf: true,
            modules: false
          }
        }
      },
      {
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
