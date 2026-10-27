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
  return vectorFromArray(
    rows,
    new FixedSizeList(rows[0].length, new Field('values', new Float32(), false))
  );
}

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`Scatterplot directly converts Arrow props on ${backend}`, async ({skip}) => {
    const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
    if (!testDevice) {
      skip();
      return;
    }
    const source = positions([
      [0, 0],
      [1, 1]
    ]).concat(positions([[2, 2]]));
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
            layer.disablePickingIndex(1);
            expect(layer.internalState!.disabledPickingIndices).toContain(1);
            layer.restorePickingColors();
            expect(layer.internalState!.disabledPickingIndices).toEqual([]);
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
              expect(columns.instancePositions.format).toBe('float32x3');
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

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`Scatterplot Arrow mode refreshes fallback positions with projection on ${backend}`, async ({
    skip
  }) => {
    const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
    if (!testDevice) {
      skip();
      return;
    }
    const {createTestViewport} = await import('../core/viewports/test-crs');
    const viewports = [2, 3].map(scale =>
      createTestViewport({
        width: 100,
        height: 100,
        signature: String(scale),
        converter: {forward: p => [p[0] * scale, p[1], p[2]], inverse: p => p}
      })
    );
    await testLayerAsync({
      viewport: viewports[0],
      Layer: ScatterplotLayer,
      device: testDevice,
      draw: false,
      testCases: [2, 3].map((scale, index) => ({
        ...(index === 0
          ? {
              props: {
                data: [
                  [10, 20],
                  [11, 21]
                ],
                getPosition: row => row,
                radii: vectorFromArray([1, 2], new Float32()),
                coordinateSystem: 'WGS84'
              }
            }
          : {}),
        viewport: viewports[index],
        onBeforeUpdate: ({layer}) => {
          if (index) {
            layer.context.layerManager.activateViewport(viewports[index]);
            layer.activateViewport(viewports[index]);
          }
        },
        onAfterUpdate: async ({layer}) => {
          if (!layer.isLoaded) return;
          const columns = (layer.state.columns as any).prepared.columns;
          const bytes = await columns.instancePositions.data[0].buffer.readAsync();
          expect(new Float32Array(bytes.buffer, bytes.byteOffset, 3)[0]).toBe(10 * scale);
          expect(columns.instancePositions64Low.format).toBe('float32x3');
          expect(layer.getAttributeManager()).toBeNull();
        }
      })),
      onError: error => {
        throw error;
      }
    });
  });
}

test('Scatterplot rejects extensions when entering or updating Arrow mode', async () => {
  const {LayerExtension} = await import('@deck.gl/core');
  const errors: Error[] = [];
  await testLayerAsync({
    Layer: ScatterplotLayer,
    draw: false,
    testCases: [
      {props: {data: [{}, {}], getPosition: () => [0, 0]}},
      {
        updateProps: {
          positions: positions([
            [0, 0],
            [1, 1]
          ]),
          extensions: [new LayerExtension()]
        },
        onAfterUpdate: () => expect(errors.at(-1)?.message).toContain('do not support extensions')
      },
      {updateProps: {extensions: []}},
      {
        updateProps: {extensions: [new LayerExtension()]},
        onAfterUpdate: () => expect(errors.at(-1)?.message).toContain('do not support extensions')
      }
    ],
    onError: error => {
      errors.push(error);
    }
  });
  expect(errors).toHaveLength(2);
});

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`Scatterplot Arrow mode preserves binary radii and logical row indexes on ${backend}`, async ({
    skip
  }) => {
    const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
    if (!testDevice) {
      skip();
      return;
    }
    const radii = testDevice.createBuffer({data: new Float32Array([3, 5])});
    try {
      await testLayerAsync({
        Layer: ScatterplotLayer,
        device: testDevice,
        testCases: [
          {
            props: {
              positions: positions([
                [0, 0],
                [1, 1]
              ]),
              data: {length: 2, attributes: {getRadius: radii, rowIndexes: new Uint32Array([5, 7])}}
            },
            onAfterUpdate: ({layer}) => {
              if (!layer.isLoaded) return;
              const columns = (layer.state.columns as any).prepared.columns;
              expect(columns.instanceRadius.data[0].buffer).toBe(radii);
              expect(columns.rowIndexes.format).toBe('uint32');
              layer.disablePickingIndex(5);
              expect(layer.internalState!.disabledPickingIndices).toEqual([5]);
              layer.restorePickingColors();
            }
          }
        ],
        onError: error => {
          throw error;
        }
      });
      expect(radii.destroyed).toBe(false);
    } finally {
      radii.destroy();
    }
  });
}

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`Scatterplot hybrid columns wait for row data on ${backend}`, async ({skip}) => {
    const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
    if (!testDevice) {
      skip();
      return;
    }
    let finalLength = 0;
    await testLayerAsync({
      Layer: ScatterplotLayer,
      device: testDevice,
      testCases: [
        {
          props: {radii: vectorFromArray([1, 2], new Float32())},
          onAfterUpdate: ({layer}) => expect(layer.getNumInstances()).toBe(0)
        },
        {
          updateProps: {data: Promise.resolve([{position: [0, 0]}, {position: [1, 1]}])},
          onAfterUpdate: ({layer}) => {
            if (layer.isLoaded) finalLength = layer.getNumInstances();
          }
        }
      ],
      onError: error => {
        throw error;
      }
    });
    expect(finalLength).toBe(2);
  });

  test(`Scatterplot hybrid columns render integer binary attributes on ${backend}`, async ({
    skip
  }) => {
    const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
    if (!testDevice) {
      skip();
      return;
    }
    await testLayerAsync({
      Layer: ScatterplotLayer,
      device: testDevice,
      testCases: [
        {
          props: {
            positions: positions([
              [0, 0],
              [1, 1]
            ]),
            data: {
              length: 2,
              attributes: {
                getRadius: new Int32Array([3, 5]),
                getFillColor: new Uint16Array([65535, 0, 0, 65535, 0, 65535, 0, 65535])
              }
            }
          },
          onAfterUpdate: ({layer}) => {
            if (!layer.isLoaded) return;
            const columns = (layer.state.columns as any).prepared.columns;
            expect(columns.instanceRadius.format).toBe('float32');
            expect(columns.instanceFillColors.format).toBe('unorm16x4');
          }
        }
      ],
      onError: error => {
        throw error;
      }
    });
  });
}
