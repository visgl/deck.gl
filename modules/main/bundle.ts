// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {H3HexagonLayer, H3Decoder} from '@deck.gl/geo-layers';

export * from '../core/bundle';
export * from '@deck.gl/layers';
export * from '@deck.gl/aggregation-layers';
export * from '@deck.gl/extensions';
export * from '@deck.gl/geo-layers';
export * from '@deck.gl/google-maps';
export * from '@deck.gl/mesh-layers';
export * from '@deck.gl/mapbox';
export * from '@deck.gl/widgets';

/* eslint-disable import/no-extraneous-dependencies */
/** h3-js is not bundled due to webpack's externals config
 * This will resolve to undefined unless h3-js is included via script tag
 */
import * as h3 from 'h3-js';

/* eslint-disable import/namespace */
// Check for H3 library. In the standalone bundle, h3-js is not included (see `scripts/bundle.config.js`)
function _checkH3Lib(): void {
  const installHelp =
    'include the <script src="https://unpkg.com/h3-js@^4.0.0"></script> tag before the deck.gl script tag. https://deck.gl/docs/api-reference/geo-layers/h3-hexagon-layer';
  if (!h3) {
    throw new Error(`To use H3 functionality, ${installHelp}`);
    // @ts-ignore
  } else if (h3.polyfill && !h3.polygonToCells) {
    throw new Error(`Incompatible h3-js version. ${installHelp}`);
  }
}

H3HexagonLayer._checkH3Lib = _checkH3Lib;
H3Decoder.initialize = _checkH3Lib;
