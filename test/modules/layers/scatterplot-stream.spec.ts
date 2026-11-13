// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterAll, beforeAll, expect, test, vi} from 'vitest';
import {GPUDataEvaluator} from '@luma.gl/graph/gpu-simple-graph';
import {tableFromArrays} from 'apache-arrow';
import {ScatterplotLayer} from '@deck.gl/layers';
import {device, testLayerAsync} from '@deck.gl/test-utils/vitest';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';

// Match the Arrow lifecycle tests: pooled buffers must not outlive each test layer.
const bufferPoolSize = GPUDataEvaluator.bufferPoolSize;
beforeAll(() => {
  GPUDataEvaluator.bufferPoolSize = 0;
});
afterAll(() => {
  GPUDataEvaluator.bufferPoolSize = bufferPoolSize;
});

for (const backend of ['webgl', 'webgpu'] as const) {
  for (const mode of ['batched', 'snapshots'] as const) {
    test(`Scatterplot renders and picks Arrow streams in ${mode} mode on ${backend}`, async ({
      skip
    }) => {
      const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
      if (!testDevice) return skip();
      const source = tableFromArrays({
        longitude: [0, 1],
        latitude: [0, 1],
        label: ['first', 'last']
      });
      async function* stream() {
        yield source.slice(0, 1).batches[0];
        yield source.slice(1);
      }
      const loaded = vi.fn();
      let verified = false;
      await testLayerAsync({
        Layer: ScatterplotLayer,
        device: testDevice,
        testCases: [
          {
            props: {
              data: Promise.resolve(stream()),
              _dataLoadingMode: mode,
              getPosition: row => [row.longitude, row.latitude],
              getRadius: 100,
              pickable: true,
              onDataLoad: loaded
            },
            onAfterUpdate: ({layer}) => {
              if (!loaded.mock.calls.length || layer.internalState?.needsUpdate) return;
              const count = mode === 'batched' ? 2 : 1;
              expect(layer.getNumInstances()).toBe(count);
              const info = layer.getPickingInfo({
                info: {
                  index: count - 1,
                  color: null,
                  layer,
                  picked: true,
                  x: 0,
                  y: 0,
                  pixelRatio: 1
                },
                mode: 'query',
                sourceLayer: null
              });
              expect(info.object.label).toBe('last');
              expect(layer.getBounds()).toEqual(
                mode === 'batched'
                  ? [
                      [0, 0, 0],
                      [1, 1, 0]
                    ]
                  : [
                      [1, 1, 0],
                      [1, 1, 0]
                    ]
              );
              verified = true;
            }
          }
        ],
        onError: error => {
          throw error;
        }
      });
      expect(loaded).toHaveBeenCalledOnce();
      expect(verified).toBe(true);
    });
  }
}
