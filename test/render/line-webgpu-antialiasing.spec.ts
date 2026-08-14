// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, test, expect} from 'vitest';
import {LineLayer} from '@deck.gl/layers';
import {isRenderTestDeviceEnabled} from './render-test-suite';
import {measureWebGPUEdges, STROKE_COLOR} from './webgpu-antialiasing-test-utils';

const LINES = [0, 1, 2, 3].map(index => ({
  sourcePosition: [-110, -70 + index * 42],
  targetPosition: [110, -64 + index * 51]
}));

describe.skipIf(!isRenderTestDeviceEnabled('webgpu'))('LineLayer#antialiasing on WebGPU', () => {
  test('coverage is applied before premultiplication', async () => {
    const {partial, worstOvershoot} = await measureWebGPUEdges([
      new LineLayer({
        id: 'webgpu-line-antialiasing',
        data: LINES,
        getColor: STROKE_COLOR,
        getWidth: 2,
        widthUnits: 'pixels',
        antialiasing: true
      })
    ]);

    expect(partial, `lines should be feathered (got ${partial} partial pixels)`).toBeGreaterThan(
      300
    );
    expect(worstOvershoot, 'premultiplied red should track alpha').toBeLessThanOrEqual(2);
  }, 60000);
});
