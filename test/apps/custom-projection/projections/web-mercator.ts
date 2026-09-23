// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import proj4 from 'proj4';
import type {ProjectionConfig} from './projection-config';

const MAX_LATITUDE = 85.0511287798066;
const projection = proj4('EPSG:4326', 'EPSG:3857');
const east = projection.forward([180, 0])[0];
const north = projection.forward([0, MAX_LATITUDE])[1];

export default {
  projection,
  inputBounds: [-180, -MAX_LATITUDE, 180, MAX_LATITUDE],
  outputBounds: [-east, -north, east, north],
  note: 'The familiar web map projection, with increasing scale distortion toward the poles. Latitude clamped to ±85.05°.'
} satisfies ProjectionConfig;
