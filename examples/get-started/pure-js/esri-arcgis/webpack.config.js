// NOTE: To use this example standalone (e.g. outside of deck.gl repo)
// delete the local development overrides at the bottom of this file

const ArcGISPlugin = require('@arcgis/webpack-plugin');
const path = require('path');

const CONFIG = {
  mode: 'development',

  entry: {
    app: './app.js'
  },

  plugins: [
    new ArcGISPlugin({
      features: {
        '3d': false
      }
    })
  ],

  resolve: {
    modules: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'node_modules')],
    extensions: ['.js']
  },

  node: {
    process: false,
    global: false,
    fs: 'empty'
  }
};

// This line enables bundling against src in this repo rather than installed module
module.exports = env => (env ? require('../../../webpack.config.local')(CONFIG)(env) : CONFIG);
