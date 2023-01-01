import * as deckglAggregationLayers from './src';

// @ts-expect-error deck is not defined on globalThis
const deck = globalThis.deck || {};

// Check if peer dependencies are included
if (!deck.LineLayer) {
  throw new Error('@deck.gl/layers is not found');
}

export default Object.assign(deck, deckglAggregationLayers);
