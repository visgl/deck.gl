const {resolve} = require('path');
// const webpack = require('webpack');

module.exports = {
  // Bundle the source code
  entry: {
    lib: resolve('./src/index.js')
  },

  // Silence warnings about big bundles
  stats: {
    warnings: false
  },

  output: {
    // Generate the bundle in dist folder
    path: resolve('./dist'),
    filename: '[name]-bundle.js',
    library: 'deck.gl',
    libraryTarget: 'umd'
  },

  // Exclude any non-relative imports from resulting bundle
  externals: [
    /^[a-z\.\-0-9]+$/
  ],

  module: {
    rules: [
      {
        // Inline shaders
        test: /\.glsl$/,
        exclude: /node_modules/,
        loader(content) {
          this.cacheable && this.cacheable(); // eslint-disable-line
          this.value = content;
          return "module.exports = " + JSON.stringify(content); // eslint-disable-line
        }
      },
      // {
      //   // Compile ES2015 using buble
      //   test: /\.js$/,
      //   loader: 'buble-loader',
      //   include: [/src/],
      //   options: {
      //     objectAssign: 'Object.assign',
      //     transforms: {
      //       dangerousForOf: true,
      //       modules: false
      //     }
      //   }
      // },
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
    // leave minification to app
    // new webpack.optimize.UglifyJsPlugin({comments: false})
  ]
};
