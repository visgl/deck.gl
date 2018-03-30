const {resolve} = require('path');

const PACKAGE_ROOT = resolve(__dirname, '..');
const ROOT = resolve(PACKAGE_ROOT, '../..');

const version = require(resolve(ROOT, 'package.json')).version;
const config = require('./dev.config');

module.exports = {
  ...config,

  entry: resolve(PACKAGE_ROOT, 'src/index.js'),

  mode: 'production',

  // Generate a bundle in dist folder
  output: {
    path: resolve(PACKAGE_ROOT, 'dist'),
    filename: `deckgl-${version}.min.js`
  },

  devtool: ''
};
