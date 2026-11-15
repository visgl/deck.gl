// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {LineLayer, PointCloudLayer} from '@deck.gl/layers';
import {device, testLayerAsync} from '@deck.gl/test-utils/vitest';
import {Texture} from '@luma.gl/core';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {GPUVectorModel} from '@luma.gl/engine';
import {Field, FixedSizeList, Float32, vectorFromArray} from 'apache-arrow';

function positions(rows: number[][]) {
  return vectorFromArray(rows, new FixedSizeList(2, new Field('values', new Float32(), false)));
}

for (const backend of ['webgl', 'webgpu'] as const) {
  for (const kind of ['line', 'point'] as const) {
    test(`${kind} Arrow columns draw on ${backend}`, async ({skip}) => {
      const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
      if (!testDevice) return skip();
      const first = positions([
        [0, 0],
        [1, 1]
      ]);
      const second = positions([
        [2, 2],
        [3, 3]
      ]);
      const getColor = vi.fn(() => [255, 0, 0, 255]);
      const texture = testDevice.createTexture({
        width: 32,
        height: 32,
        format: 'rgba8unorm',
        usage: Texture.RENDER_ATTACHMENT | Texture.COPY_SRC
      });
      const framebuffer = testDevice.createFramebuffer({colorAttachments: [texture]});
      try {
        await testLayerAsync({
          Layer: kind === 'line' ? LineLayer : PointCloudLayer,
          device: testDevice,
          draw: false,
          testCases: [
            {
              props:
                kind === 'line'
                  ? {data: [{}, {}], getSourcePosition: first, getTargetPosition: second, getColor}
                  : {data: [{}, {}], getPosition: first, getColor},
              onAfterUpdate: async ({layer}) => {
                if (!layer.isLoaded) return;
                expect(layer.getAttributeManager()).toBeNull();
                expect(layer.getNumInstances()).toBe(2);
                expect(layer.state.model!.constructor).toBe(GPUVectorModel);
                expect(getColor).toHaveBeenCalledTimes(2);
                if (backend === 'webgpu') (testDevice as any).handle.pushErrorScope('validation');
                const pass = testDevice.beginRenderPass({framebuffer});
                layer.context.renderPass = pass;
                layer.draw({uniforms: {}});
                pass.end();
                testDevice.submit();
                if (backend === 'webgpu')
                  expect(await (testDevice as any).handle.popErrorScope()).toBeNull();
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
}

for (const backend of ['webgl', 'webgpu'] as const) {
  for (const kind of ['line', 'point'] as const) {
    test(`${kind} Arrow batches honor instance limits on ${backend}`, async ({skip}) => {
      const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
      if (!testDevice) return skip();
      const column = positions([
        [0, 0],
        [1, 1]
      ]).concat(positions([[2, 2]]));
      const texture = testDevice.createTexture({
        width: 32,
        height: 32,
        format: 'rgba8unorm',
        usage: Texture.RENDER_ATTACHMENT
      });
      const framebuffer = testDevice.createFramebuffer({colorAttachments: [texture]});
      try {
        await testLayerAsync({
          Layer: kind === 'line' ? LineLayer : PointCloudLayer,
          device: testDevice,
          draw: false,
          testCases: [
            {
              props:
                kind === 'line'
                  ? {
                      data: [{}, {}, {}],
                      getSourcePosition: column,
                      getTargetPosition: column,
                      numInstances: 1
                    }
                  : {data: [{}, {}, {}], getPosition: column, numInstances: 1},
              onAfterUpdate: async ({layer}) => {
                if (!layer.isLoaded) return;
                expect(layer.getNumInstances()).toBe(1);
                const model = layer.state.model!;
                const counts = vi.spyOn(model, 'setInstanceCount');
                try {
                  if (backend === 'webgpu') (testDevice as any).handle.pushErrorScope('validation');
                  const pass = testDevice.beginRenderPass({framebuffer});
                  layer.context.renderPass = pass;
                  layer.draw({uniforms: {}});
                  pass.end();
                  testDevice.submit();
                  if (backend === 'webgpu')
                    expect(await (testDevice as any).handle.popErrorScope()).toBeNull();
                  expect(counts.mock.calls.map(([count]) => count)).toContain(0);
                  expect(counts.mock.calls.map(([count]) => count)).toContain(1);
                } finally {
                  counts.mockRestore();
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
}

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`LineLayer Arrow positions pick on both sides of the date line on ${backend}`, async ({
    skip
  }) => {
    const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
    if (!testDevice) return skip();
    const {Deck, MapView} = await import('@deck.gl/core');
    const parent = document.createElement('div');
    document.body.appendChild(parent);
    const layer = new LineLayer({
      getSourcePosition: positions([[179, 0]]),
      getTargetPosition: positions([[-179, 0]]),
      getWidth: 8,
      wrapLongitude: true,
      pickable: true
    });
    const viewState = {longitude: 179.5, latitude: 0, zoom: 4};
    const deck = new Deck({
      parent,
      device: testDevice,
      width: 64,
      height: 64,
      useDevicePixels: false,
      views: new MapView(),
      viewState,
      layers: [layer]
    });
    try {
      // Model compilation can finish before asynchronous Arrow column uploads.
      await expect.poll(() => layer.isLoaded).toBe(true);
      await expect
        .poll(() => layer.getModels().map(model => model.pipeline.linkStatus))
        .toEqual(['success', 'success']);
      expect((await deck.pickObjectAsync({x: 32, y: 32}))?.index).toBe(0);
      deck.setProps({viewState: {...viewState, longitude: -179.5}});
      expect((await deck.pickObjectAsync({x: 32, y: 32}))?.index).toBe(0);
      deck.setProps({viewState: {...viewState, longitude: 0}});
      expect(await deck.pickObjectAsync({x: 32, y: 32})).toBeNull();
    } finally {
      deck.finalize();
      parent.remove();
    }
  });
}

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`PointCloudLayer keeps loader binary attributes with Arrow colors on ${backend}`, async ({
    skip
  }) => {
    const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
    if (!testDevice) return skip();
    const {Uint8} = await import('apache-arrow');
    const colors = vectorFromArray(
      [
        [255, 0, 0, 255],
        [0, 255, 0, 255]
      ],
      new FixedSizeList(4, new Field('values', new Uint8(), false))
    );
    const data = {
      header: {vertexCount: 2},
      attributes: {
        POSITION: {size: 3, value: new Float32Array([0, 0, 0, 1, 1, 0])},
        NORMAL: {size: 3, value: new Float32Array([0, 0, 1, 0, 0, 1])}
      }
    };
    const texture = testDevice.createTexture({
      width: 32,
      height: 32,
      format: 'rgba8unorm',
      usage: Texture.RENDER_ATTACHMENT
    });
    const framebuffer = testDevice.createFramebuffer({colorAttachments: [texture]});
    try {
      await testLayerAsync({
        Layer: PointCloudLayer,
        device: testDevice,
        draw: false,
        testCases: [
          {
            props: {data, getColor: colors},
            onAfterUpdate: async ({layer}) => {
              if (!layer.isLoaded) return;
              expect(layer.getNumInstances()).toBe(2);
              const prepared = (layer.state.columns as any).prepared;
              expect(prepared.columns.instancePositions.data[0].length).toBe(2);
              expect(prepared.columns.instanceNormals.data[0].length).toBe(2);
              if (backend === 'webgpu') (testDevice as any).handle.pushErrorScope('validation');
              const pass = testDevice.beginRenderPass({framebuffer});
              layer.context.renderPass = pass;
              layer.draw({uniforms: {}});
              pass.end();
              testDevice.submit();
              if (backend === 'webgpu')
                expect(await (testDevice as any).handle.popErrorScope()).toBeNull();
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

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`PointCloudLayer preserves borrowed normal buffers on ${backend}`, async ({skip}) => {
    const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
    if (!testDevice) return skip();
    const {Buffer} = await import('@luma.gl/core');
    const normalBuffer = testDevice.createBuffer({
      data: new Float32Array([0, 0, 1, 0, 0, 1]),
      usage: Buffer.VERTEX | Buffer.COPY_DST
    });
    try {
      await testLayerAsync({
        Layer: PointCloudLayer,
        device: testDevice,
        draw: false,
        testCases: [
          {
            props: {
              getPosition: positions([
                [0, 0],
                [1, 1]
              ]),
              data: {
                length: 2,
                attributes: {getNormal: {buffer: normalBuffer, size: 3, type: 'float32'}}
              }
            },
            onAfterUpdate: ({layer}) => {
              if (!layer.isLoaded) return;
              const prepared = (layer.state.columns as any).prepared;
              expect(prepared.columns.instanceNormals.data[0].buffer).toBe(normalBuffer);
            }
          }
        ],
        onError: error => {
          throw error;
        }
      });
      expect(normalBuffer.destroyed).toBe(false);
    } finally {
      normalBuffer.destroy();
    }
  });
}

for (const backend of ['webgl', 'webgpu'] as const) {
  for (const kind of ['line', 'point'] as const) {
    test(`${kind} switches between row accessors and Arrow columns on ${backend}`, async ({
      skip
    }) => {
      const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
      if (!testDevice) return skip();
      const column = positions([
        [0, 0],
        [1, 1]
      ]);
      let uploadedBuffer: {destroyed: boolean} | undefined;
      const data = [
        {position: [0, 0], sourcePosition: [0, 0], targetPosition: [1, 1]},
        {position: [1, 1], sourcePosition: [1, 1], targetPosition: [2, 2]}
      ];
      await testLayerAsync({
        Layer: kind === 'line' ? LineLayer : PointCloudLayer,
        device: testDevice,
        draw: false,
        testCases: [
          {
            props: {data},
            onAfterUpdate: ({layer}) => {
              expect(layer.getAttributeManager()).not.toBeNull();
            }
          },
          {
            updateProps:
              kind === 'line'
                ? {getSourcePosition: column, getTargetPosition: column}
                : {getPosition: column},
            onAfterUpdate: ({layer}) => {
              if (!layer.isLoaded) return;
              expect(layer.getAttributeManager()).toBeNull();
              const prepared = (layer.state.columns as any).prepared;
              const input =
                kind === 'line'
                  ? prepared.columns.instanceSourcePositions
                  : prepared.columns.instancePositions;
              uploadedBuffer = input.data[0].buffer;
              expect(uploadedBuffer!.destroyed).toBe(false);
            }
          },
          {
            updateProps:
              kind === 'line'
                ? {getSourcePosition: null, getTargetPosition: row => row.position}
                : {getPosition: row => row.position},
            onAfterUpdate: ({layer}) => {
              expect(layer.getAttributeManager()).not.toBeNull();
              expect(uploadedBuffer!.destroyed).toBe(true);
            }
          }
        ],
        onError: error => {
          throw error;
        }
      });
    });
  }
}

for (const kind of ['line', 'point'] as const) {
  test(`${kind} Arrow colors use binary positions without a data length`, async () => {
    const values = {size: 3, value: new Float32Array([0, 0, 0, 1, 1, 0])};
    const colors = vectorFromArray(
      [
        [1, 0, 0, 1],
        [0, 1, 0, 1]
      ],
      new FixedSizeList(4, new Field('rgba', new Float32()))
    );
    let checked = false;
    await testLayerAsync({
      Layer: kind === 'line' ? LineLayer : PointCloudLayer,
      device,
      draw: false,
      testCases: [
        {
          title: 'Infer binary attribute length from the Arrow column',
          props: {
            data: {
              attributes:
                kind === 'line'
                  ? {getSourcePosition: values, instanceTargetPositions: values}
                  : {instancePositions: values}
            },
            getColor: colors,
            numInstances: 2
          },
          onAfterUpdate: ({layer}) => {
            if (!layer.isLoaded) return;
            expect(layer.state.columns?.length).toBe(2);
            expect(layer.getBounds()).toEqual([
              [0, 0, 0],
              [1, 1, 0]
            ]);
            checked = true;
          }
        }
      ],
      onError: error => {
        throw error;
      }
    });
    expect(checked).toBe(true);
  });
}
