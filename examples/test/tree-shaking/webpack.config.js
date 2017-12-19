// avoid destructuring for older Node version support
const resolve = require('path').resolve;
const webpack = require('webpack');

const CONFIG = {
  entry: {
    app: resolve('./app.js')
  },

  devtool: 'source-maps',

  output: {
    path: resolve('./dist'),
    filename: 'bundle.js'
  },

  module: {
    rules: [
      {
        // Compile ES2015 using buble
        test: /\.js$/,
        loader: 'buble-loader',
        include: [resolve('.')],
        exclude: [/node_modules/],
        options: {
          objectAssign: 'Object.assign'
        }
      }
    ]
  },

  resolve: {
    alias: {
      // From mapbox-gl-js README. Required for non-browserify bundlers (e.g. webpack):
      'mapbox-gl$': resolve('./node_modules/mapbox-gl/dist/mapbox-gl.js')
    }
  },

  // Optional: Enables reading mapbox token from environment variable
  plugins: [new webpack.EnvironmentPlugin(['MapboxAccessToken'])]
};

module.exports = env => {
  if (env && env.prod) {
    delete CONFIG.devtool;

    CONFIG.plugins.push(
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
      })
      // ,
      /* eslint-disable camelcase */
      // new webpack.optimize.UglifyJsPlugin({
      //   compress: {
      //     warnings: false,
      //     screw_ie8: true,
      //     conditionals: true,
      //     unused: true,
      //     comparisons: true,
      //     sequences: true,
      //     dead_code: true,
      //     evaluate: true,
      //     if_return: true,
      //     join_vars: true
      //   },
      //   output: {
      //     comments: false
      //   }
      // })
    );
  }

  return CONFIG;
};
