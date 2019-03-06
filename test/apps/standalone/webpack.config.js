/* global process */
const webpack = require('webpack');

const CONFIG = {
  entry: {
    main: './index.js'
  },

  mode: 'development',

  plugins: [
    new webpack.DefinePlugin({
      __MAPBOX_TOKEN__: JSON.stringify(process.env.MapboxAccessToken) // eslint-disable-line
    })
  ]
};

module.exports = env => (env ? require('../webpack.config.local')(CONFIG)(env) : CONFIG);
