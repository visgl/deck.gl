const {resolve} = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    app: resolve('./app.js')
  },

  devtool: '#inline-source-map',

  devServer: {stats: {warnings: false}},

  resolve: {
    alias: {
      // mapbox-gl config
      // Per mapbox-gl-js README for non-browserify bundlers
      'mapbox-gl$': resolve('./node_modules/mapbox-gl/dist/mapbox-gl.js'),
      // 'gl-matrix': resolve('./node_modules/gl-matrix/dist/gl-matrix.js'),
      // Work against base library
      'deck.gl': resolve('../../src'),
      // // Debugging vpm
      // 'viewport-mercator-project': resolve('../src/lib/viewports'),
      // Using our dependencies
      'luma.gl': resolve('./node_modules/luma.gl'),
      react: resolve('./node_modules/react')
    }
  },

  module: {
    rules: [
      {
        // Compile ES2015 using buble
        test: /\.js$/,
        loader: 'buble-loader',
        exclude: [/node_modules/, /dist/],
        options: {
          objectAssign: 'Object.assign',
          transforms: {
            dangerousForOf: true,
            modules: false
          }
        }
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        // Mapbox has some unresolved fs calls
        include: [resolve('../../src')],
        loader: 'transform-loader',
        options: 'brfs-babel'
      }
    ]
  },

  node: {
    fs: 'empty'
  },

  // Allow setting mapbox token using environment variables
  plugins: [
    new webpack.EnvironmentPlugin(['MAPBOX_ACCESS_TOKEN', 'MapboxAccessToken'])
  ]
};
