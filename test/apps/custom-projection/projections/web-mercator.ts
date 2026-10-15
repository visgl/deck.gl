// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {projectionEngine} from '@math.gl/projection';
import type {ProjectionConfig} from './projection-config';

const MAX_LATITUDE = 85.0511287798066;
const fromCrs = 'EPSG:4326';
const toCrs = 'EPSG:3857';
const converter = projectionEngine.createProjection({from: fromCrs, to: toCrs});
const projection = {forward: converter.project, inverse: converter.unproject};

export default {
  fromCrs,
  toCrs,
  projection,
  fromBounds: [-180, -MAX_LATITUDE, 180, MAX_LATITUDE],
  note: 'The familiar web map projection, with increasing scale distortion toward the poles. Latitude clamped to ±85.05°.'
} satisfies ProjectionConfig;
