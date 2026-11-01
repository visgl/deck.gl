// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {ArcLayer} from '@deck.gl/layers';
import {device, testLayerAsync} from '@deck.gl/test-utils/vitest';
import {Texture} from '@luma.gl/core';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {Field, FixedSizeList, Float32, vectorFromArray} from 'apache-arrow';

function positions(rows: number[][]) {
  return vectorFromArray(rows, new FixedSizeList(2, new Field('values', new Float32(), false)));
}

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`ArcLayer draws matching Arrow chunks on ${backend}`, async ({skip}) => {
    const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
    if (!testDevice) return skip();
    const sourcePositions = positions([
      [0, 0],
      [1, 1]
    ]).concat(positions([[2, 2]]));
    const targetPositions = positions([
      [1, 0],
      [2, 1]
    ]).concat(positions([[3, 2]]));
    const getWidth = vi.fn(() => 2);
    const texture = testDevice.createTexture({
      width: 16,
      height: 16,
      format: 'rgba8unorm',
      usage: Texture.RENDER_ATTACHMENT
    });
    const framebuffer = testDevice.createFramebuffer({colorAttachments: [texture]});
    try {
      await testLayerAsync({
        Layer: ArcLayer,
        device: testDevice,
        draw: false,
        testCases: [
          {
            props: {data: [{}, {}, {}], sourcePositions, targetPositions, getWidth},
            onAfterUpdate: async ({layer}) => {
              if (!layer.isLoaded) return;
              expect(layer.getAttributeManager()).toBeNull();
              expect(layer.getNumInstances()).toBe(3);
              expect(getWidth).toHaveBeenCalledTimes(3);
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
                expect(bindings).toHaveBeenCalledTimes(2);
                expect(
                  bindings.mock.calls.map(call => call[0].instanceSourcePositions.length)
                ).toEqual([2, 1]);
              } finally {
                bindings.mockRestore();
              }
            }
          }
        ],
        onError: error => {
          throw error;
        }
      });
    } finally {
      framebuffer.destroy();
      texture.destroy();
    }
  });
}

test('ArcLayer reports WebGPU vertex buffer limits for many varying attributes', async ({skip}) => {
  const testDevice = await getWebGPUTestDevice('core');
  if (!testDevice) return skip();
  const {ArcLayerColumns} = await import('../../../modules/layers/src/arc-layer/arc-layer-columns');
  const columns = new ArcLayerColumns(testDevice);
  const position = positions([
    [0, 0],
    [1, 1]
  ]);
  const scalar = vectorFromArray([1, 2], new Float32());
  const color = vectorFromArray(
    [
      [1, 0, 0, 1],
      [0, 1, 0, 1]
    ],
    new FixedSizeList(4, new Field('value', new Float32(), false))
  );
  const error = vi.fn();
  try {
    await columns.update(
      {
        sourcePositions: position,
        targetPositions: position,
        sourceColors: color,
        targetColors: color,
        widths: scalar,
        heights: scalar,
        tilts: scalar
      },
      () => {},
      error,
      {fp64: true}
    );
    expect(error).toHaveBeenCalledOnce();
    expect(error.mock.calls[0][0].message).toMatch('vertex buffers');
    expect(columns.length).toBe(0);
    error.mockClear();
    await columns.update(
      {
        sourcePositions: position,
        targetPositions: position,
        sourceColors: color,
        targetColors: color,
        widths: scalar,
        heights: scalar,
        getTilt: 0
      },
      () => {},
      error,
      {fp64: true}
    );
    expect(error).toHaveBeenCalledOnce();
    expect(error.mock.calls[0][0].message).toMatch('vertex buffers');
  } finally {
    columns.destroy();
  }
});
