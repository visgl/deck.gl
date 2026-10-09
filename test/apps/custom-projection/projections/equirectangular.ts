// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {projectionEngine} from '@math.gl/projection';
import type {ProjectionConfig} from './projection-config';

const RADIUS = 6371008.8;
// Keep input coordinates just inside the poles.
const MAX_LATITUDE = 89.999999;
const fromCrs = 'EPSG:4326';
const toCrs = `+proj=eqc +R=${RADIUS} +units=m`;
const converter = projectionEngine.createProjection({from: fromCrs, to: toCrs});
const projection = {forward: converter.project, inverse: converter.unproject};

export default {
  fromCrs,
  toCrs,
  projection,
  fromBounds: [-180, -MAX_LATITUDE, 180, MAX_LATITUDE],
  note: 'A rectangular map with evenly spaced longitude and latitude lines, stretching shapes near the poles. Latitude clamped just inside ±90°.'
} satisfies ProjectionConfig;
