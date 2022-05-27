const MapboxUtils = require('./src');

// @ts-ignore (2339) undefined property
const deck = globalThis.deck || {};

// Check if peer dependencies are included
if (!deck.Layer) {
  throw new Error('@deck.gl/core is not found');
}

module.exports = Object.assign(deck, MapboxUtils);
