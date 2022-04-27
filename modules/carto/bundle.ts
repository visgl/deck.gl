const CartoUtils = require('./src');

const deck = globalThis.deck || {};

// Check if peer dependencies are included
if (!deck.LineLayer) {
  throw new Error('@deck.gl/layers is not found');
}

// Export carto layer library for pydeck integration
globalThis.CartoLayerLibrary = {CartoLayer: CartoUtils.CartoLayer};

module.exports = Object.assign(deck, {carto: CartoUtils});
