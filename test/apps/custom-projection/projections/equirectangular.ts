// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import proj4 from 'proj4';
import type {ProjectionConfig} from './projection-config';

const RADIUS = 6371008.8;
// proj4js eqc wraps exact ±90° to the opposite pole.
const MAX_LATITUDE = 89.999999;
const fromCrs = 'EPSG:4326';
const toCrs = `+proj=eqc +R=${RADIUS} +units=m`;
const projection = proj4(fromCrs, toCrs);
const east = projection.forward([180, 0])[0];
const north = projection.forward([0, MAX_LATITUDE])[1];

export default {
  fromCrs,
  toCrs,
  projection,
  fromBounds: [-180, -MAX_LATITUDE, 180, MAX_LATITUDE],
  toBounds: [-east, -north, east, north],
  note: 'A rectangular map with evenly spaced longitude and latitude lines, stretching shapes near the poles. Latitude clamped just inside ±90°.'
} satisfies ProjectionConfig;
