/* global window */
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
deck.H3HexagonLayer._checkH3Lib = () => {
  const installHelp =
    'include the <script src="https://unpkg.com/h3-js@^3.0.0"></script> tag before the deck.gl script tag. https://deck.gl/docs/api-reference/geo-layers/h3-hexagon-layer';
  // @ts-ignore
  if (!window.h3) {
    throw new Error(`To use H3 functionality, ${installHelp}`);
    // @ts-ignore
  } else if (!window.h3.polyfill && window.h3.polygonToCells) {
    throw new Error(`Incompatible h3-js version. ${installHelp}`);
  }
};

module.exports = deck;
