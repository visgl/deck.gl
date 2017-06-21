// NOTE: To use this example standalone (e.g. outside of deck.gl repo)
// delete the local development overrides at the bottom of this file

// avoid destructuring for older Node version support
const resolve = require('path').resolve;

const CONFIG = {
  entry: {
    app: resolve('./app.js')
  },

  devtool: 'source-map',

  module: {
    rules: [
      {
        // Compile ES2015 using buble
        // test: /\.js$/,
        test: /^((?!graph-layer).)*\.js$/,
        loader: 'buble-loader',
        include: [resolve('.')],
        exclude: [/node_modules/],
        options: {
          objectAssign: 'Object.assign'
        }
      },
      {
        // ...except graph-layer.js, which needs to not be transpiled
        // when running this example within deck.gl source,
        // so that it can extend the untranspiled CompositeLayer from deck.gl src.
        // TODO: when running against npm-packaged deck.gl (outside of deck.gl src),
        // graph-layer.js should be transpiled like everything else...
        test: /graph-layer/,
        loader: 'exports-loader'
      }
    ]
  }
};

// This line enables bundling against src in this repo rather than installed deck.gl module
module.exports = env => env ? require('../webpack.config.local')(CONFIG)(env) : CONFIG;
