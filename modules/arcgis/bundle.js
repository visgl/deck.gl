const ArcGISUtils = require('./src/load-modules');

/* global window, global */
const _global = typeof window === 'undefined' ? global : window;
const deck = _global.deck || {};

// Check if peer dependencies are included
if (!deck.Layer) {
  throw new Error('@deck.gl/core is not found');
}

module.exports = Object.assign(deck, ArcGISUtils);
