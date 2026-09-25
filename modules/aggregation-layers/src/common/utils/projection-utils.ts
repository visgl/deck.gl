// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Viewport} from '@deck.gl/core';

/** Use the same linear position projection for both aggregation backends. */
export function createAggregationViewport(viewport: Viewport, center: number[]): Viewport {
  const ViewportType = viewport.constructor as any;
  return new ViewportType({
    projection: {forward: (p: number[]) => p, inverse: (p: number[]) => p},
    fromCrs: 'map-meters',
    center: [...viewport.unprojectFlat(center), 0],
    zoom: 12
  });
}
