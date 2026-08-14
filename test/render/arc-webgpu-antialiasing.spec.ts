// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, test, expect} from 'vitest';
import {MapView} from '@deck.gl/core';
import {ArcLayer} from '@deck.gl/layers';
import {isRenderTestDeviceEnabled} from './render-test-suite';
import {measureWebGPUEdges, STROKE_COLOR} from './webgpu-antialiasing-test-utils';

describe.skipIf(!isRenderTestDeviceEnabled('webgpu'))('ArcLayer#antialiasing on WebGPU', () => {
  test('coverage is applied before premultiplication', async () => {
    const {partial, worstOvershoot} = await measureWebGPUEdges(
      [
        new ArcLayer({
          id: 'webgpu-arc-antialiasing',
          data: [0, 1, 2, 3].map(index => ({
            sourcePosition: [-122.49, 37.73 + index * 0.015],
            targetPosition: [-122.41, 37.732 + index * 0.018]
          })),
          getSourceColor: STROKE_COLOR,
          getTargetColor: STROKE_COLOR,
          getWidth: 2,
          getHeight: 0.4,
          antialiasing: true
        })
      ],
      new MapView(),
      {longitude: -122.45, latitude: 37.76, zoom: 11}
    );

    expect(partial, `arcs should be feathered (got ${partial} partial pixels)`).toBeGreaterThan(
      300
    );
    expect(worstOvershoot, 'premultiplied red should track alpha').toBeLessThanOrEqual(2);
  }, 60000);
});
