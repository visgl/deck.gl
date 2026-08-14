// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, test, expect} from 'vitest';
import {PointCloudLayer} from '@deck.gl/layers';
import {isRenderTestDeviceEnabled} from './render-test-suite';
import {measureWebGPUEdges, STROKE_COLOR} from './webgpu-antialiasing-test-utils';

describe.skipIf(!isRenderTestDeviceEnabled('webgpu'))(
  'PointCloudLayer#antialiasing on WebGPU',
  () => {
    test('coverage is applied before premultiplication', async () => {
      const {partial, worstOvershoot} = await measureWebGPUEdges([
        new PointCloudLayer({
          id: 'webgpu-point-cloud-antialiasing',
          data: [
            {position: [-75.5, -40.25, 0]},
            {position: [-18.25, 32.5, 0]},
            {position: [42.75, -22.5, 0]},
            {position: [83.5, 47.25, 0]}
          ],
          pointSize: 20,
          getColor: STROKE_COLOR,
          antialiasing: true
        })
      ]);

      expect(partial, `points should be feathered (got ${partial} partial pixels)`).toBeGreaterThan(
        300
      );
      expect(worstOvershoot, 'premultiplied red should track alpha').toBeLessThanOrEqual(2);
    }, 60000);
  }
);
