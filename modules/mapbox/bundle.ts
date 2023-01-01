import * as MapboxUtils from './src';

const deck = globalThis.deck || {};

// Check if peer dependencies are included
if (!deck.Layer) {
  throw new Error('@deck.gl/core is not found');
}

export default Object.assign(deck, MapboxUtils);
