/* global process */
const {resolve} = require('path');
const webpack = require('webpack');

const PACKAGE_ROOT = resolve(__dirname, '..');
const ROOT = resolve(PACKAGE_ROOT, '../..');

module.exports = {
  entry: resolve(PACKAGE_ROOT, 'test/index.js'),

  mode: 'development',

  devServer: {
    contentBase: resolve(PACKAGE_ROOT, 'test')
  },

  resolve: {
    alias: {
      'deck.gl': resolve(ROOT, 'src'),
      'mapbox-gl': resolve(PACKAGE_ROOT, 'webpack/mapbox-gl'),
      './mapbox': resolve(PACKAGE_ROOT, 'node_modules/react-map-gl/src/mapbox/mapbox.js')
    }
  },

  module: {
    rules: [
      {
        // Compile ES2015 using babel
        test: /\.js$/,
        loader: 'babel-loader',
        include: ['src', 'node_modules/react-map-gl'],
        options: {
          presets: ['es2015']
        }
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      __MAPBOX_TOKEN__: JSON.stringify(process.env.MapboxAccessToken) // eslint-disable-line
    })
  ]
};
