// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import proj4 from 'proj4';
import type {ProjectionConfig} from './projection-config';

// EPSG:8857: WGS 84 / Equal Earth Greenwich.
const fromCrs = 'EPSG:4326';
const toCrs = '+proj=eqearth +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m';
const projection = proj4(fromCrs, toCrs);
const east = projection.forward([180, 0])[0];
const north = projection.forward([0, 90])[1];
export default {
  fromCrs,
  toCrs,
  projection,
  fromBounds: [-180, -90, 180, 90],
  toBounds: [-east, -north, east, north],
  note: 'A rounded equal-area world map that preserves the relative sizes of continents. Full world extent.'
} satisfies ProjectionConfig;
