const deckGLLayers = require('./src');

const deck = globalThis.deck || {};

// Check if peer dependencies are included
if (!deck.Layer) {
  throw new Error('@deck.gl/core is not found');
}

module.exports = Object.assign(deck, deckGLLayers);
