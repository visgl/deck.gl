// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import proj4 from 'proj4';
import type {ProjectionConfig} from './projection-config';

const fromCrs = 'EPSG:4326';
const toCrs = '+proj=stere +lat_0=90 +lon_0=0 +x_0=0 +y_0=0 +k=1 +R=6371008.8 +units=m';
const projection = proj4(fromCrs, toCrs);

export default {
  fromCrs,
  toCrs,
  projection,
  fromBounds: [-180, -60, 180, 90],
  note: 'A view centered on the North Pole that preserves local angles, with increasing scale distortion away from the center. Latitude clamped at 60°S.'
} satisfies ProjectionConfig;
