const {resolve} = require('path');
// const webpack = require('webpack');

module.exports = {
  // Bundle the transpiled code in dist
  entry: {
    lib: resolve('./src/index.js')
  },

  // Generate a bundle in dist folder
  output: {
    path: resolve('./dist'),
    filename: '[name]-bundle.js',
    library: 'deck.gl',
    libraryTarget: 'umd'
  },

  // Exclude any non-relative imports from resulting bundle
  externals: [
    /^[a-z\.\-0-9]+$/
  ],

  stats: {
    warnings: false
  },

  module: {
    rules: [
      {
        // Compile ES2015 using buble
        test: /\.js$/,
        loader: 'buble-loader',
        include: [/src/],
        options: {
          objectAssign: 'Object.assign',
          transforms: {
            dangerousForOf: true,
            modules: false
          }
        }
      },
      {
        // Inline shaders
        include: [resolve('./src')],
        loader: 'transform-loader',
        options: 'brfs-babel'
      }
    ]
  },

  node: {
    fs: 'empty'
  },

  plugins: [
    // new webpack.optimize.UglifyJsPlugin({comments: false})
  ]
};
