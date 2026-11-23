// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Viewport} from '@deck.gl/core';

// Aggregation consumes packed target-CRS positions. Its camera must scale those
// coordinates linearly, without constructing or invoking a second CRS converter.
class AggregationViewport extends Viewport {
  private readonly sourceProjectionMode: number;

  constructor(viewport: Viewport, center: number[]) {
    super({
      crs: viewport.crs,
      position: [...viewport.unprojectFlat(center), 0],
      distanceScales: viewport.distanceScales,
      zoom: 12
    });
    this.sourceProjectionMode = viewport.projectionMode;
  }

  get projectionMode(): number {
    // Packed positions retain the source viewport's shader coordinate conventions.
    return this.sourceProjectionMode;
  }

  protected _getCenter(_options, position: number[]): number[] {
    const [x, y] = this.projectFlat(position);
    return [x, y, (position[2] || 0) * this.distanceScales.unitsPerWorldUnit[2]];
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
  return new AggregationViewport(viewport, center);
}
