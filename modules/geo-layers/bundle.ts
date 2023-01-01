import * as deckGLLayers from './src';

const deck = globalThis.deck || {};

// Check if peer dependencies are included
if (!deck.LineLayer) {
  throw new Error('@deck.gl/layers is not found');
}

export default Object.assign(deck, deckGLLayers);
