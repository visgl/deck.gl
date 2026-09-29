// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {projectionEngine} from '@math.gl/projection';
import type {ProjectionConfig} from './projection-config';

const fromCrs = 'EPSG:4326';
const toCrs = '+proj=stere +lat_0=90 +lon_0=0 +x_0=0 +y_0=0 +k=1 +R=6371008.8 +units=m';
const converter = projectionEngine.createProjection({from: fromCrs, to: toCrs});
const projection = {forward: converter.project, inverse: converter.unproject};

export default {
  fromCrs,
  toCrs,
  projection,
  fromBounds: [-180, -60, 180, 90],
  toBounds: [-extent, -extent, extent, extent],
  note: 'A view centered on the North Pole that preserves local angles, with increasing scale distortion away from the center. Latitude clamped at 60°S.'
} satisfies ProjectionConfig;
