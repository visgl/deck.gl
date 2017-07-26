const {resolve, join} = require('path');
const webpack = require('webpack');

const rootDir = join(__dirname, '..');
const libSources = join(rootDir, 'src');

// Otherwise modules imported from outside this directory does not compile
// Seems to be a Babel bug
// https://github.com/babel/babel-loader/issues/149#issuecomment-191991686
const BABEL_CONFIG = {
  presets: [
    'es2015',
    'stage-2',
    'react'
  ].map(name => require.resolve(`babel-preset-${name}`)),
  plugins: [
    'transform-decorators-legacy'
  ].map(name => require.resolve(`babel-plugin-${name}`))
};

const COMMON_CONFIG = {

  entry: ['./src/main'],

  module: {
    rules: [
      {
        // Compile ES2015 using bable
        test: /\.js$/,
        loader: 'babel-loader',
        options: BABEL_CONFIG,
        include: [resolve('..'), libSources],
        exclude: [/node_modules/]
      }, {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader', 'autoprefixer-loader']
      }, {
        test: /\.(eot|svg|ttf|woff|woff2|gif|jpe?g|png)$/,
        loader: 'url-loader'
      }
    ],

    // Uglify seems to be incompatible with mapbox
    // https://github.com/mapbox/mapbox-gl-js/issues/4359#issuecomment-288001933
    noParse: /(mapbox-gl)\.js$/
  },

  resolve: {
    alias: {
      // For importing modules that are not exported at root
      'deck.gl/dist': libSources,
      'deck.gl': libSources,
      'luma.gl': resolve('.', './node_modules/luma.gl'),
      react: resolve('.', './node_modules/react'),
      // // used by Mapbox
      // webworkify: 'webworkify-webpack-dropin',
      // From mapbox-gl-js README. Required for non-browserify bundlers (e.g. webpack):
      'mapbox-gl$': resolve('./node_modules/mapbox-gl/dist/mapbox-gl.js'),
      'd3-scale': resolve('.', './node_modules/d3-scale'),
      rbush: resolve('.', './node_modules/rbush')
    }
  },

  node: {
    fs: 'empty'
  },

  plugins: [
    new webpack.DefinePlugin({
      MapboxAccessToken: `"${process.env.MapboxAccessToken}"` // eslint-disable-line
    })
  ]

};

const addDevConfig = config => {

  config.module.rules.push({
    // Unfortunately, webpack doesn't import library sourcemaps on its own...
    test: /\.js$/,
    use: ['source-map-loader'],
    enforce: 'pre'
  });

  return Object.assign(config, {

    devtool: 'source-maps',

    plugins: config.plugins.concat([
      // new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    ])

  });

};

const addProdConfig = config => {

  return Object.assign(config, {
    output: {
      path: resolve(__dirname, './dist'),
      filename: 'bundle.js'
    }
  });
};

module.exports = env => {
  env = env || {};

  let config = COMMON_CONFIG;

  if (env.local) {
    config = addDevConfig(config);
  }

  if (env.prod) {
    config = addProdConfig(config);
  }

  // Enable to debug config
  // console.warn(JSON.stringify(config, null, 2));

  return config;
};
