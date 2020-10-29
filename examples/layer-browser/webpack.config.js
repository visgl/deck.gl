// NOTE: To use this example standalone (e.g. outside of deck.gl repo)
// delete the local development overrides at the bottom of this file

// avoid destructuring for older Node version support
const resolve = require('path').resolve;

const CONFIG = {
  mode: 'development',

  devtool: 'source-map',

  // bundle app.js and everything it imports, recursively.
  entry: {
    app: resolve('./src')
  },

  resolve: {
    // Make src files outside of this dir resolve modules in our node_modules folder
    modules: [resolve(__dirname, '.'), resolve(__dirname, 'node_modules'), 'node_modules'],
    alias: {
      // From mapbox-gl-js README. Required for non-browserify bundlers (e.g. webpack):
      'mapbox-gl$': resolve('./node_modules/mapbox-gl/dist/mapbox-gl.js'),
      '@math.gl/web-mercator': resolve('../../node_modules/@math.gl/web-mercator')
    }
  },

  module: {
    rules: [
      {
        // Remove if your app does not use JSX or you don't need to support old browsers
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: [/node_modules/],
        options: {
          presets: ['@babel/preset-react']
        }
      }
      // ,
      // {
      //   // The example has some JSON data
      //   test: /\.json$/,
      //   loader: 'json-loader',
      //   exclude: [/node_modules/]
      // }
    ]
  },

  node: {
    fs: 'empty'
  }
};

// This line enables bundling against src in this repo rather than installed deck.gl module
module.exports = env => (env ? require('../webpack.config.local')(CONFIG, __dirname)(env) : CONFIG);
