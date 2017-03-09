const {resolve, join} = require('path');
const webpack = require('webpack');

const rootDir = join(__dirname, '../..');
const demoDir = join(__dirname, '..');
const libSources = join(rootDir, 'src');
const demoSources = join(demoDir, 'src');

module.exports = {

  entry: ['./src/main'],

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
      include: demoSources,
      enforce: 'post'
    }, {
      test: /\.js$/,
      loader: 'transform-loader?brfs-babel'
    }]
  },

  resolve: {
    modules: [resolve(rootDir, 'node_modules'), resolve(demoDir, 'node_modules')],
    alias: {
      'deck.gl': libSources,
      webworkify: 'webworkify-webpack-dropin'
      // react: resolve('./node_modules/react'),
      // 'react-dom': resolve('./node_modules/react-dom'),
      // 'gl-matrix': resolve('./node_modules/gl-matrix/dist/gl-matrix.js')
    }
  },

  node: {
    fs: 'empty'
  },

  plugins: [
    new webpack.DefinePlugin({
      MAPBOX_ACCESS_TOKEN: `"${process.env.MAPBOX_ACCESS_TOKEN}"` // eslint-disable-line
    })
  ]

};
