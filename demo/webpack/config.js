const {resolve, join} = require('path');
const webpack = require('webpack');

const rootDir = join(__dirname, '../..');
const demoDir = join(__dirname, '..');
const libSources = join(rootDir, 'src');
const demoSources = join(demoDir, 'src');

// Otherwise modules imported from outside this directory does not compile
// Seems to be a Babel bug
// https://github.com/babel/babel-loader/issues/149#issuecomment-191991686
const BABEL_CONFIG = {
  presets: [
    'es2015',
    'react',
    'stage-2'
  ].map(function(name) { return require.resolve("babel-preset-"+name) }),
  "plugins": [
    "transform-decorators-legacy"
  ].map(function(name) { return require.resolve("babel-plugin-"+name) })
};

module.exports = {

  entry: ['./src/main'],

  module: {
    rules: [{
      test: /\.js$/,
      exclude: [/node_modules/],
      loader: 'babel-loader',
      query: BABEL_CONFIG
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
    }]
  },

  resolve: {
    modules: [resolve(rootDir, 'node_modules'), resolve(demoDir, 'node_modules')],
    alias: {
      'deck.gl': libSources,
      // used by Mapbox
      webworkify: 'webworkify-webpack-dropin',
      // From mapbox-gl-js README. Required for non-browserify bundlers (e.g. webpack):
      'mapbox-gl$': resolve('./node_modules/mapbox-gl/dist/mapbox-gl.js')
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
