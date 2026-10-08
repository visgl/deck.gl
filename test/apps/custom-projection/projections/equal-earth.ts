// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Projection} from '@math.gl/projection';
import type {ProjectionConfig} from './projection-config';

// EPSG:8857: WGS 84 / Equal Earth Greenwich.
const fromCrs = 'EPSG:4326';
const toCrs = '+proj=eqearth +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m';
const converter = new Projection({from: fromCrs, to: toCrs});
const projection = {forward: converter.project, inverse: converter.unproject};
export default {
  fromCrs,
  toCrs,
  projection,
  fromBounds: [-180, -90, 180, 90],
  note: 'A rounded equal-area world map that preserves the relative sizes of continents. Full world extent.'
} satisfies ProjectionConfig;
