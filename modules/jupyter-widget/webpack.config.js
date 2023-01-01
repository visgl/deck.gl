const {resolve} = require('path');
const getBundleConfig = require('../../scripts/bundle.config');

/**
 * Embeddable @deck.gl/jupyter-widget bundle
 *
 * Used in JupyterLab (whose entry point is at plugin.js) and Jupyter Notebook alike.
 *
 */
const config = {
  ...getBundleConfig(),

  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: resolve(__dirname, 'dist'),
    libraryTarget: 'umd'
  },
  devtool: 'source-map',
  externals: ['@jupyter-widgets/base']
};

module.exports = config;
