// Enables ES2015 import/export in Node.js
require('reify');

// Registers an alias for this module
const path = require('path');
const moduleAlias = require('module-alias');
moduleAlias.addAlias('deck.gl-test-utils', path.resolve('./src'));
moduleAlias.addAlias('deck.gl/test/data', path.resolve('../../test/data'));

require('babel-polyfill');

// Import headless luma support
require('luma.gl/headless');
