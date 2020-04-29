// NOTE: To use this example standalone (e.g. outside of deck.gl repo)
// delete the local development overrides at the bottom of this file

const webpack = require('webpack');
const {addHarpWebpackConfig} = require('@here/harp-webpack-utils/scripts/HarpWebpackConfig');

let config = {
  mode: 'development',

  entry: {
    app: './app.js'
  },

  // Optional: Enables reading mapbox token from environment variable
  plugins: [new webpack.EnvironmentPlugin(['HereApiKey'])]
};

config = addHarpWebpackConfig(config, {
  mainEntry: './app.js',
  decoderEntry: './decoder.js',
  htmlTemplate: './index.html'
});

// This line enables bundling against src in this repo rather than installed module
module.exports = env => (env ? require('../../../webpack.config.local')(config)(env) : config);
