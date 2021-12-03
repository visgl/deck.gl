const deckGLLayers = require('./src');

const deck = globalThis.deck || {};

// Check if peer dependencies are included
if (!deck.LineLayer) {
  throw new Error('@deck.gl/layers is not found');
}

module.exports = Object.assign(deck, deckGLLayers);
