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
        test: /\.js$/,
        loader: 'buble-loader',
        include: [resolve('.')],
        exclude: [/node_modules/],
        options: {
          objectAssign: 'Object.assign',
          transforms: {
            dangerousForOf: true,
            modules: false
          }
        }
      }
    ]
  },

  resolve: {
    alias: {
      'viewport-mercator-project': resolve(
        './node_modules/viewport-mercator-project/dist/index.js'
      ),
      'deck.gl': resolve('./node_modules/deck.gl/dist-es6')
    }
  },

  plugins: []
};

// This line enables bundling against src in this repo rather than installed deck.gl module
module.exports = env => (env ? require('../webpack.config.local')(CONFIG)(env) : CONFIG);
