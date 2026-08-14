// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// WebGPU blends premultiplied, so analytic coverage must be folded into alpha before
// `deckgl_premultiplied_alpha`. Otherwise RGB remains too bright and creates a light edge halo.

import {describe, test, expect} from 'vitest';
import {PathLayer} from '@deck.gl/layers';
import {isRenderTestDeviceEnabled} from './render-test-suite';
import {measureWebGPUEdges, STROKE_COLOR} from './webgpu-antialiasing-test-utils';

const DIAGONALS = [0, 1, 2, 3].map(index => ({
  path: [
    [-110, -70 + index * 42],
    [110, -70 + index * 42 + 6 + index * 9]
  ]
}));

describe.skipIf(!isRenderTestDeviceEnabled('webgpu'))('PathLayer#antialiasing on WebGPU', () => {
  test('coverage is applied before premultiplication', async () => {
    const {partial, worstOvershoot} = await measureWebGPUEdges([
      new PathLayer({
        id: 'webgpu-path-antialiasing',
        data: DIAGONALS,
        getPath: data => data.path,
        getColor: STROKE_COLOR,
        getWidth: 2,
        widthUnits: 'pixels',
        antialiasing: true
      })
    ]);

    expect(partial, `strokes should be feathered (got ${partial} partial pixels)`).toBeGreaterThan(
      300
    );
    expect(
      worstOvershoot,
      `premultiplied red should track alpha (worst overshoot ${worstOvershoot})`
    ).toBeLessThanOrEqual(2);
  }, 60000);
});
