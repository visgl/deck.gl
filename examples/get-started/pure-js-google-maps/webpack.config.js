// NOTE: To use this example standalone (e.g. outside of deck.gl repo)
// delete the local development overrides at the bottom of this file

// avoid destructuring for older Node version support
const resolve = require('path').resolve;
const webpack = require('webpack');

const CONFIG = {
  mode: 'development',

  entry: {
    app: resolve('./app.js')
  },

  // Optional: Enables reading Google Maps API Key from environment variable
  plugins: [new webpack.EnvironmentPlugin(['GOOGLE_MAPS_API_KEY'])]
};

// This line enables bundling against src in this repo rather than installed module
module.exports = env => (env ? require('../../webpack.config.local')(CONFIG)(env) : CONFIG);
