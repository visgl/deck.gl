// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Viewport, _PROJECTION_MODE as PROJECTION_MODE} from '@deck.gl/core';

// Aggregation consumes packed target-CRS positions. Its camera must scale those
// coordinates linearly, without constructing or invoking a second CRS converter.
class AggregationViewport extends Viewport {
  get projectionMode(): number {
    return PROJECTION_MODE.CUSTOM_GEOSPATIAL;
  }
  projectFlat(position: number[]): [number, number] {
    return [
      position[0] * this.distanceScales.unitsPerWorldUnit[0],
      position[1] * this.distanceScales.unitsPerWorldUnit[1]
    ];
  }
  unprojectFlat(position: number[]): [number, number] {
    return [
      position[0] / this.distanceScales.unitsPerWorldUnit[0],
      position[1] / this.distanceScales.unitsPerWorldUnit[1]
    ];
  }
}

/** Use the same linear position projection for both aggregation backends. */
export function createAggregationViewport(viewport: Viewport, center: number[]): Viewport {
  return new AggregationViewport({
    position: [...viewport.unprojectFlat(center), 0],
    distanceScales: viewport.distanceScales,
    zoom: 12
  });
}
