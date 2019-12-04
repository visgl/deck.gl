/**
 * Pulls together all deck.gl dependencies used
 * in @deck.gl/jupyter-widget
 */
const deck = require('../../core/bundle');

const {experimental} = deck;

Object.assign(
  deck,
  require('@deck.gl/layers'),
  require('@deck.gl/aggregation-layers'),
  require('@deck.gl/geo-layers'),
  require('@deck.gl/mesh-layers'),
  require('@deck.gl/json')
);

Object.assign(deck.experimental, experimental);

module.exports = deck;
