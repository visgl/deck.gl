// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import proj4 from 'proj4';
import type {ProjectionConfig} from './projection-config';

const MAX_LATITUDE = 85.0511287798066;
const fromCrs = 'EPSG:4326';
const toCrs = 'EPSG:3857';
const projection = proj4(fromCrs, toCrs);

export default {
  fromCrs,
  toCrs,
  projection,
  fromBounds: [-180, -MAX_LATITUDE, 180, MAX_LATITUDE],
  note: 'The familiar web map projection, with increasing scale distortion toward the poles. Latitude clamped to ±85.05°.'
} satisfies ProjectionConfig;
