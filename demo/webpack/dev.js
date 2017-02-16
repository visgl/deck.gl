const {resolve, join} = require('path');
const webpack = require('webpack');

const sources = join(__dirname, '../../src');
const demo = join(__dirname, '../src');

module.exports = {

  entry: ['./src/main'],

  devtool: 'cheap-source-maps',

  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader'
    }, {
      test: /\.scss$/,
      loaders: ['style-loader', 'css-loader', 'sass-loader', 'autoprefixer-loader']
    }, {
      test: /\.(eot|svg|ttf|woff|woff2|gif|jpe?g|png)$/,
      loader: 'url-loader'
    }, {
      test: /\.glsl$/,
      loader: 'raw-loader',
      include: demo,
      enforce: 'post'
    }, {
      include: [/src\/.*\.js$/, /node_modules\/mapbox-gl.*\.js$/],
      loader: 'transform-loader?brfs-babel'
    }]
  },

  resolve: {
    alias: {
      webworkify: 'webworkify-webpack-dropin',
      react: resolve('./node_modules/react'),
      'deck.gl': sources,
      'react-dom': resolve('./node_modules/react-dom'),
      'gl-matrix': resolve('./node_modules/gl-matrix/dist/gl-matrix.js')
    }
  },

  node: {
    fs: 'empty'
  },

  plugins: [
    new webpack.DefinePlugin({
      MAPBOX_ACCESS_TOKEN: `"${process.env.MAPBOX_ACCESS_TOKEN}"`
    })
  ]

};
