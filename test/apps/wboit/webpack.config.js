// NOTE: To use this example standalone (e.g. outside of deck.gl repo)
// delete the local development overrides at the bottom of this file
const {resolve} = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const CONFIG = {
  mode: 'development',

  entry: {
    app: '.'
  },

  resolve: {
    alias: {
      data: resolve(__dirname, '../../../examples/layer-browser/data')
    }
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: [/node_modules/],
        options: {
          presets: ['@babel/preset-react']
        }
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({title: 'deck.gl example'}),
    new webpack.EnvironmentPlugin(['MapboxAccessToken'])
  ]
};

// This line enables bundling against src in this repo rather than installed module
module.exports = env => (env ? require('../webpack.config.local')(CONFIG)(env) : CONFIG);
