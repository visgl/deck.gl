const {resolve} = require('path');
const webpack = require('webpack');

module.exports = {
  // Bundle the transpiled code in dist
  entry: {
    lib: resolve('./dist/index.js')
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
    /^[a-z\-0-9]+$/
  ],

  stats: {
    warnings: false
  },

  devtool: '#inline-source-maps',

  // resolve: {
  //   alias: {
  //     'deck.gl': resolve('./dist')
  //   }
  // },

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
        // Mapbox has some unresolved fs calls
        include: [resolve('./src')],
        loader: 'transform-loader',
        options: 'brfs'
      },
      {
        test: /\.glsl$/,
        loader: 'file?name=[path][name].[ext]'
      }
    ]
  },

  plugins: [
    // new webpack.optimize.UglifyJsPlugin({comments: false})
  ]
  /*
  plugins: [
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      compress: {
        sequences: true,
        dead_code: true,
        conditionals: true,
        booleans: true,
        unused: true,
        if_return: true,
        join_vars: true,
        drop_console: true
      },
      mangle: {
        except: ['$super', '$', 'exports', 'require']
      },
      output: {
        comments: false
      }
    })
  ]
  */
};
