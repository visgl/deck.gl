const deck = require('../core/bundle');
const {experimental} = deck;

Object.assign(
  deck,
  require('@deck.gl/layers'),
  require('@deck.gl/aggregation-layers'),
  require('@deck.gl/extensions'),
  require('@deck.gl/geo-layers'),
  require('@deck.gl/google-maps'),
  require('@deck.gl/mesh-layers'),
  require('@deck.gl/mapbox'),
  require('@deck.gl/json')
);

// Make sure core exports are preserved
Object.assign(deck.experimental, experimental);

module.exports = deck;
