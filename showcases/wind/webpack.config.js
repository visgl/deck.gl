const {resolve} = require('path');

const CONFIG = {
  entry: {
    app: resolve('./src/app.js')
  },

  devtool: 'source-maps',

  output: {
    path: resolve('./dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: resolve('./src')
      },
      {
        include: [resolve('./src')],
        loader: 'transform-loader',
        query: 'brfs-babel'
      }
    ]
  },

  resolve: {
    alias: {
      'mapbox-gl$': resolve('./node_modules/mapbox-gl/dist/mapbox-gl.js')
    }
  }
};

// This line enables bundling against src in this repo rather than installed deck.gl module
module.exports = env => (env ? require('../../examples/webpack.config.local')(CONFIG)(env) : CONFIG);
