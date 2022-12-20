import deck from '../core/bundle';

import * as deckglLayers from '@deck.gl/layers';
import * as deckglAggregationLayers from '@deck.gl/aggregation-layers';
import * as deckglExtensions from '@deck.gl/extensions';
import * as deckglGeoLayers from '@deck.gl/geo-layers';
import * as GoogleMapsUtils from '@deck.gl/google-maps';
import * as deckglMeshLayers from '@deck.gl/mesh-layers';
import * as MapboxUtils from '@deck.gl/mapbox';

/** h3-js is not bundled due to webpack's externals config
 * This will resolve to undefined unless h3-js is included via script tag
 */
import * as h3 from 'h3-js';

Object.assign(
  deck,
  deckglLayers,
  deckglAggregationLayers,
  deckglExtensions,
  deckglGeoLayers,
  GoogleMapsUtils,
  deckglMeshLayers,
  MapboxUtils
);

/* eslint-disable import/namespace */
// Check for H3 library. In the standalone bundle, h3-js is not included (see `scripts/bundle.config.js`)
deck.H3HexagonLayer._checkH3Lib = () => {
  const installHelp =
    'include the <script src="https://unpkg.com/h3-js@^3.0.0"></script> tag before the deck.gl script tag. https://deck.gl/docs/api-reference/geo-layers/h3-hexagon-layer';
  if (!h3) {
    throw new Error(`To use H3 functionality, ${installHelp}`);
    // @ts-ignore
  } else if (!h3.polyfill && h3.polygonToCells) {
    throw new Error(`Incompatible h3-js version. ${installHelp}`);
  }
};

export default deck;
