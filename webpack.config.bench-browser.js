// Webpack 2 configuration file for running tests in browser
const {resolve} = require('path');
module.exports = require('./webpack.config.test-browser');

// Replace the entry point for webpack-dev-server
module.exports.entry = {
  'test-browser': resolve('./test/bench/browser.js')
};

module.exports.module.noParse = [
  /benchmark/
];
