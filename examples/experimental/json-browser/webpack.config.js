// @noflow
/* eslint-disable */
// NOTE: To use this example standalone (e.g. outside of deck.gl repo)
// delete the local development overrides at the bottom of this file

const {resolve} = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const CONFIG = {
  mode: 'development',

  entry: {
    app: resolve('./root.js')
  },

  module: {
    rules: [
      {
        // Compile ES2015 using buble
        test: /\.js$/,
        loader: 'buble-loader',
        include: [resolve('..')],
        exclude: [/node_modules/],
        options: {
          objectAssign: 'Object.assign',
        }
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({title: 'JSON Browser'}),
    // Optional: Enables reading mapbox token from environment variable
    new webpack.EnvironmentPlugin(['MapboxAccessToken'])
  ],

  node: {fs: 'empty'}
};

// This line enables bundling against src in this repo rather than installed deck.gl module
module.exports = env => (env ? require('../../webpack.config.local')(CONFIG, __dirname)(env) : CONFIG);
