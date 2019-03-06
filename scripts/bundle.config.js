/* global process */
const {resolve} = require('path');
const webpack = require('webpack');

const getAliases = require('../aliases');

const PACKAGE_ROOT = resolve('.');
const PACKAGE_INFO = require(resolve(PACKAGE_ROOT, 'package.json'));

/**
 * peerDependencies are excluded using `externals`
 * e.g. @deck.gl/core is not bundled with @deck.gl/geo-layers
 */

let externals = {};
const {peerDependencies = {}} = PACKAGE_INFO;

for (const depName in peerDependencies) {
  if (depName.startsWith('@deck.gl')) {
    // Instead of bundling the dependency, import from the global `deck` object
    externals[depName] = 'deck';
  }
}

if (externals['@deck.gl/core']) {
  // Do not bundle luma.gl if `core` is peer dependency
  externals = [
    externals,
    (context, request, callback) => {
      if (/^@?luma\.gl/.test(request)) {
        return callback(null, 'luma');
      }
      return callback();
    }
  ];
}

const config = {
  mode: 'production',

  entry: {
    main: resolve('./bundle/index.js')
  },

  output: {
    libraryTarget: 'umd',
    path: PACKAGE_ROOT,
    filename: 'dist.min.js'
  },

  resolve: {
    alias: Object.assign({}, getAliases('src'))
  },

  module: {
    rules: [
      {
        // Compile ES2015 using babel
        test: /\.js$/,
        loader: 'babel-loader',
        include: /src/
      }
    ]
  },

  externals,

  plugins: [
    // This is used to define the __VERSION__ constant in core/lib/init.js
    // babel-plugin-version-inline uses the package version from the working directory
    // Therefore we need to manually import the correct version from the core
    // This is called in prepublishOnly, after lerna bumps the package versions
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(PACKAGE_INFO.version)
    })
  ],

  devtool: false
};

module.exports = config;
