import * as CartoUtils from './src';

const deck = globalThis.deck || {};

// Check if peer dependencies are included
if (!deck.LineLayer) {
  throw new Error('@deck.gl/layers is not found');
}

// Export carto layer library for pydeck integration
// More info: https://github.com/ajduberstein/pydeck_custom_layer
globalThis.CartoLayerLibrary = CartoUtils;

export default Object.assign(deck, {carto: CartoUtils});
