/* global process */
const {resolve} = require('path');
const webpack = require('webpack');

const PACKAGE_ROOT = resolve(__dirname, '.');
const ROOT = resolve(PACKAGE_ROOT, '../..');

const version = require(resolve(ROOT, 'package.json')).version;

const config = {
  resolve: {
    alias: {
      'deck.gl': resolve(ROOT, 'src'),
      'mapbox-gl': resolve(PACKAGE_ROOT, 'utils/mapbox-gl'),
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
          presets: ['stage-2', 'es2015']
        }
      }
    ]
  }
};

const devConfig = {
  ...config,

  entry: resolve(PACKAGE_ROOT, 'test/index.js'),

  mode: 'development',

  devServer: {
    contentBase: resolve(PACKAGE_ROOT, 'test')
  },

  plugins: [
    new webpack.DefinePlugin({
      __MAPBOX_TOKEN__: JSON.stringify(process.env.MapboxAccessToken) // eslint-disable-line
    })
  ]
};

const prodConfig = {
  ...config,

  entry: resolve(PACKAGE_ROOT, 'src/index.js'),

  mode: 'production',

  // Generate a bundle in dist folder
  output: {
    path: resolve(PACKAGE_ROOT, 'dist'),
    filename: `deckgl-${version}.min.js`
  },

  devtool: ''
};

module.exports = env => (env ? devConfig : prodConfig);
