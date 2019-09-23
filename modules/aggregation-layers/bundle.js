const deckGLLayers = require('./src');

/* global window, global */
const _global = typeof window === 'undefined' ? global : window;
const deck = _global.deck || {};

// Check if peer dependencies are included
if (!deck.LineLayer) {
  throw new Error('@deck.gl/layers is not found');
}
// Merge experimental exports
Object.assign(deckGLLayers.experimental, deck.experimental);

module.exports = Object.assign(deck, deckGLLayers);
