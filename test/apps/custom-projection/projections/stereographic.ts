// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import proj4 from 'proj4';
import type {ProjectionConfig} from './projection-config';

const projection = proj4(
  'EPSG:4326',
  '+proj=stere +lat_0=90 +lon_0=0 +x_0=0 +y_0=0 +k=1 +R=6371008.8 +units=m'
);
const extent = Math.abs(projection.forward([0, -60])[1]);

export default {
  projection,
  inputBounds: [-180, -60, 180, 90],
  outputBounds: [-extent, -extent, extent, extent],
  note: 'A view centered on the North Pole that preserves local angles, with increasing scale distortion away from the center. Latitude clamped at 60°S.'
} satisfies ProjectionConfig;
