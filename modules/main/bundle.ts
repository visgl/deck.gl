const deck = require('../core/bundle');

Object.assign(
  deck,
  require('@deck.gl/layers'),
  require('@deck.gl/aggregation-layers'),
  require('@deck.gl/extensions'),
  require('@deck.gl/geo-layers'),
  require('@deck.gl/google-maps'),
  require('@deck.gl/mesh-layers'),
  require('@deck.gl/mapbox')
);

// Check for H3 library. In the standalone bundle, h3-js is not included (see `scripts/bundle.config.js`)
deck.H3HexagonLayer._checkH3Lib = lib => {
  if (!lib) {
    throw new Error(
      'To use H3 functionality, include the <script src="https://unpkg.com/h3-js"></script> tag before the deck.gl script tag. https://deck.gl/docs/api-reference/geo-layers/h3-hexagon-layer'
    );
  }
};

module.exports = deck;
