// Enables ES2015 import/export in Node.js
require('reify');

// Enables import of glsl
const fs = require('fs');
require.extensions['.glsl'] = function readShader(module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};

// Registers an alias for this module
const path = require('path');
const moduleAlias = require('module-alias');
moduleAlias.addAlias('deck.gl', path.resolve('./src'));

require('babel-polyfill');

// Import headless luma support
require('luma.gl/headless');

require('./index');
