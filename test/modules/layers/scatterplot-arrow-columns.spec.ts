// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterAll, beforeAll, expect, test, vi} from 'vitest';
import {GPUDataEvaluator} from '@luma.gl/gpgpu';
import {ScatterplotLayer} from '@deck.gl/layers';
import {device, testLayerAsync} from '@deck.gl/test-utils/vitest';
import {ArrowConverter} from '@deck.gl/core/arrow';
import {Texture} from '@luma.gl/core';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {Field, FixedSizeList, Float32, Uint8, vectorFromArray} from 'apache-arrow';

const bufferPoolSize = GPUDataEvaluator.bufferPoolSize;
beforeAll(() => {
  GPUDataEvaluator.bufferPoolSize = 0;
});
afterAll(() => {
  GPUDataEvaluator.bufferPoolSize = bufferPoolSize;
});

function positions(rows: number[][]) {
  return vectorFromArray(rows, new FixedSizeList(3, new Field('values', new Float32(), false)));
}

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`Scatterplot directly converts Arrow props on ${backend}`, async ({skip}) => {
    const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
    if (!testDevice) {
      skip();
      return;
    }
    const source = positions([
      [0, 0, 0],
      [1, 1, 1]
    ]).concat(positions([[2, 2, 2]]));
    const radii = vectorFromArray([2], new Float32()).concat(
      vectorFromArray([4, 6], new Float32())
    );
    const colors = vectorFromArray(
      [
        [255, 0, 0, 255],
        [0, 255, 0, 255],
        [0, 0, 255, 255]
      ],
      new FixedSizeList(4, new Field('values', new Uint8(), false))
    );
    const getPosition = vi.fn(() => [0, 0, 0] as [number, number, number]);
    const getRadius = vi.fn(() => 5);
    const conversions = vi.spyOn(ArrowConverter.prototype, 'convert');
    const texture = testDevice.createTexture({
      width: 16,
      height: 16,
      format: 'rgba8unorm',
      usage: Texture.RENDER_ATTACHMENT
    });
    const framebuffer = testDevice.createFramebuffer({colorAttachments: [texture]});
    let oldBuffer;
    try {
      await testLayerAsync({
        Layer: ScatterplotLayer,
        device: testDevice,
        draw: false,
        testCases: [
          {
            props: {
              data: [{}, {}, {}],
              positions: source,
              radii,
              fillColors: colors,
              getPosition,
              getRadius
            }
          },
          {updateProps: {radiusScale: 2}},
          {
            updateProps: {
              positions: positions([
                [3, 3, 3],
                [4, 4, 4],
                [5, 5, 5]
              ]),
              radii: undefined
            }
          },
          {updateProps: {positions: undefined, fillColors: undefined}}
        ].map((testCase, index) => ({
          ...testCase,
          onAfterUpdate: async ({layer}) => {
            if (!layer.isLoaded) return;
            if (index === 3) {
              expect(layer.getAttributeManager()).not.toBeNull();
              return;
            }
            expect(layer.getAttributeManager()).toBeNull();
            expect(layer.getNumInstances()).toBe(3);
            if (index < 2) {
              expect(getPosition).not.toHaveBeenCalled();
              expect(getRadius).not.toHaveBeenCalled();
            } else {
              expect(oldBuffer.destroyed).toBe(true);
              expect(getRadius).toHaveBeenCalled();
            }
            if (index === 1) expect(conversions).not.toHaveBeenCalled();
            const model = layer.state.model!;
            const bindings = vi.spyOn(model as any, 'setGPUAttributes');
            try {
              if (backend === 'webgpu') (testDevice as any).handle.pushErrorScope('validation');
              const pass = testDevice.beginRenderPass({framebuffer});
              layer.context.renderPass = pass;
              layer.draw({uniforms: {}});
              pass.end();
              testDevice.submit();
              if (backend === 'webgpu')
                expect(await (testDevice as any).handle.popErrorScope()).toBeNull();
              expect(bindings.mock.calls).toHaveLength(index < 2 ? 3 : 1);
              const columns = bindings.mock.calls[0][0] as any;
              if (index === 0) oldBuffer = columns.instancePositions.data[0].buffer;
              expect(columns.instancePositions.length).toBe(index < 2 ? 1 : 3);
            } finally {
              bindings.mockRestore();
            }
            conversions.mockClear();
          }
        })),
        onError: error => {
          throw error;
        }
      });
      expect(source.length).toBe(3);
    } finally {
      conversions.mockRestore();
      framebuffer.destroy();
      texture.destroy();
    }
  });
}
