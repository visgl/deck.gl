// NOTE: To use this example standalone (e.g. outside of deck.gl repo)
// delete the local development overrides at the bottom of this file

// avoid destructuring for older Node version support
const resolve = require('path').resolve;
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const ALIASES = require('../../../aliases')();

const PACKAGE_ROOT = resolve(__dirname, '.');
const ROOT = resolve(PACKAGE_ROOT, '../../..');
// This is used to define the __VERSION__ constant in core/lib/init.js
// babel-plugin-version-inline uses the package version from the working directory
// Therefore we need to manually import the correct version from the core
// This is called in prepublishOnly, after lerna bumps the package versions
const CORE_VERSION = require(resolve(ROOT, 'node_modules/@deck.gl/core/package.json')).version;

const BASE_CONFIG = {
  mode: 'development',

  entry: {
    app: resolve('./app.js')
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
          objectAssign: 'Object.assign'
        }
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({title: 'JSON Browser', template: './index.html'}),
    // Optional: Enables reading mapbox token from environment variable
    new webpack.EnvironmentPlugin(['MapboxAccessToken'])
  ],

  node: {fs: 'empty'}
};

const CONFIGS = {
  base: env => BASE_CONFIG,

  dev: env =>
    Object.assign({}, BASE_CONFIG, {
      mode: 'development',

      // devServer: {
      //   contentBase: resolve(PACKAGE_ROOT, 'test')
      // },

      plugins: [
        new webpack.DefinePlugin({
          __MAPBOX_TOKEN__: JSON.stringify(process.env.MapboxAccessToken) // eslint-disable-line
        })
      ]
    }),

  prod: env =>
    Object.assign({}, BASE_CONFIG, {
      mode: 'production',

      output: {
        libraryTarget: 'umd',
        path: resolve(PACKAGE_ROOT, 'dist'),
        filename: 'json-browser.min.js'
      },

      resolve: {
        alias: ALIASES
      },

      plugins: [
        new webpack.DefinePlugin({
          __VERSION__: JSON.stringify(CORE_VERSION)
        })
      ],

      devtool: ''
    })
};

// Pick a webpack config based on --env.*** argument to webpack
function getConfig(env = {}) {
  if (env.prod) {
    return CONFIGS.prod(env);
  }
  if (env.dev) {
    return CONFIGS.dev(env);
  }
  return CONFIGS.base(env);
}

// This line enables bundling against src in this repo rather than installed deck.gl module
const config = env =>
  env ? require('../../webpack.config.local')(getConfig(env))(env) : getConfig(env);

module.exports = config;
