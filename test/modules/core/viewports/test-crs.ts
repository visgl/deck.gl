// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {_CustomProjectionViewport as CustomProjectionViewport} from '@deck.gl/core';
import type {CustomProjectionViewportOptions} from '@deck.gl/core';
import type {CRSDescriptor, CRSRenderingScale} from '@math.gl/projection/core';

/** Synthetic descriptors isolate layer and shader plumbing from projection algorithms. */
export function createTestCRS({
  converter = {forward: p => p.slice(), inverse: p => p.slice()},
  bounds = [-20037508.34275, -20037508.34275, 20037508.34275, 20037508.34275],
  distanceScale = () => [1, 1, 1],
  metersPerUnit = [1, 1, 1],
  signature = 'test'
}: {
  converter?: {forward: (p: number[]) => number[]; inverse: (p: number[]) => number[] | null};
  bounds?: number[];
  distanceScale?: (p: number[]) => CRSRenderingScale | null;
  metersPerUnit?: number[];
  signature?: string;
} = {}): CRSDescriptor {
  return {
    signature: JSON.stringify([signature, metersPerUnit]),
    coordinateFrame: 'projected',
    projection: 'test',
    parameters: {fixture: signature},
    ellipsoid: {semiMajorAxis: 6378137, semiMinorAxis: 6356752.314245179},
    axis: 'enu',
    lossy: false,
    xUnit: {name: 'test units', metersPerUnit: metersPerUnit[0]},
    yUnit: {name: 'test units', metersPerUnit: metersPerUnit[1]},
    zUnit: {name: 'test units', metersPerUnit: metersPerUnit[2]},
    renderingBounds: [
      [bounds[0], bounds[1], 0],
      [bounds[2], bounds[3], 0]
    ],
    renderingScale: distanceScale,
    getRenderingScale: distanceScale,
    converter: {
      WGS84: {
        from: converter.forward,
        to: p => {
          const result = converter.inverse(p as number[]);
          if (!result) throw new Error('Unavailable inverse');
          return result;
        },
        normalize: p => Array.from(p)
      }
    }
  } as CRSDescriptor;
}

/** Construct a viewport from a synthetic CRS fixture, with ordinary camera options. */
export function createTestViewport({
  converter,
  bounds,
  distanceScale,
  metersPerUnit,
  signature,
  ...options
}: Parameters<typeof createTestCRS>[0] &
  Partial<Omit<CustomProjectionViewportOptions, 'crs'>> = {}) {
  return new CustomProjectionViewport({
    ...options,

    crs: createTestCRS({converter, bounds, distanceScale, metersPerUnit, signature})
  });
}
