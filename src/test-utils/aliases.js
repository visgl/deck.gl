// Registers an alias for this module

const path = require('path');
const ALIASES = {
  'deck.gl-test-utils': path.resolve(__dirname, './src'),
  'deck.gl/test/data': path.resolve(__dirname, '../../test/data'),
  'deck.gl': path.resolve(__dirname, '../../src')
};

if (module.require) {
  // Enables ES2015 import/export in Node.js
  require('reify');

  const moduleAlias = require('module-alias');
  moduleAlias.addAliases(ALIASES);

  require('babel-polyfill');

  // Import headless luma support
  require('luma.gl/headless');
}

module.exports = ALIASES;
