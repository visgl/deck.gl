// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export * from '../../examples/layer-browser/src/data-samples';
export * from './viewport';
export * from './grid-aggregation-data';

import * as data from '../../examples/layer-browser/src/data-samples';
export const lines = data.choropleths.features.map(f => ({path: f.geometry.coordinates[0]}));
