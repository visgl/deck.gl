// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {ArcLayer} from '@deck.gl/layers';
import {device, testLayerAsync} from '@deck.gl/test-utils/vitest';
import {Texture} from '@luma.gl/core';
import {GPUVectorModel} from '@luma.gl/engine';
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
            props: {
              data: [{}, {}, {}],
              getSourcePosition: sourcePositions,
              getTargetPosition: targetPositions,
              getWidth
            },
            onAfterUpdate: async ({layer}) => {
              if (!layer.isLoaded) return;
              expect(layer.getAttributeManager()).toBeNull();
              expect(layer.getNumInstances()).toBe(3);
              expect(layer.getBounds()).toEqual([
                [0, 0, 0],
                [3, 2, 0]
              ]);
              expect(getWidth).toHaveBeenCalledTimes(3);
              const model = layer.state.model!;
              expect(model.constructor).toBe(GPUVectorModel);
              const bindings = vi.spyOn(model as any, 'setAttributeVectors');
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
                expect(counts.mock.calls.map(([count]) => count)).toEqual([3, 2, 2, 1, 1, 3]);
                expect(bindings).toHaveBeenCalledTimes(1);
                expect(
                  bindings.mock.calls[0][0].instanceSourcePositions.data.map(chunk => chunk.length)
                ).toEqual([2, 1]);
              } finally {
                bindings.mockRestore();
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
        getSourcePosition: position,
        getTargetPosition: position,
        getSourceColor: color,
        getTargetColor: color,
        getWidth: scalar,
        getHeight: scalar,
        getTilt: scalar
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
        getSourcePosition: position,
        getTargetPosition: position,
        getSourceColor: color,
        getTargetColor: color,
        getWidth: scalar,
        getHeight: scalar,
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

test('ArcLayer keeps picking indexes distinct across WebGPU chunks', async ({skip}) => {
  const {Deck, OrthographicView} = await import('@deck.gl/core');
  const testDevice = await getWebGPUTestDevice('core');
  if (!testDevice) return skip();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const errors: Error[] = [];
  const layer = new ArcLayer({
    id: 'chunk-picking',
    data: [{id: 0}, {id: 1}],
    getSourcePosition: positions([[-20, -20]]).concat(positions([[-20, 20]])),
    getTargetPosition: positions([[20, -20]]).concat(positions([[20, 20]])),
    getHeight: 0,
    getWidth: 10,
    pickable: true
  });
  const deck = new Deck({
    device: testDevice,
    parent: container,
    width: 128,
    height: 128,
    useDevicePixels: false,
    views: new OrthographicView(),
    initialViewState: {target: [0, 0, 0], zoom: 0},
    layers: [layer],
    onError: error => errors.push(error)
  });
  try {
    await new Promise<void>(resolve => {
      deck.setProps({
        onAfterRender: () => {
          if (layer.isLoaded) resolve();
        }
      });
    });
    const first = await deck.pickObjectAsync({x: 64, y: 44});
    const second = await deck.pickObjectAsync({x: 64, y: 84});
    expect(errors).toEqual([]);
    expect([first?.index, second?.index].sort()).toEqual([0, 1]);
  } finally {
    deck.finalize();
    container.remove();
  }
});

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`Animated flight arcs bind Arrow timestamps and clip on ${backend}`, async ({skip}) => {
    const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
    if (!testDevice) return skip();

    const {Deck, OrthographicView} = await import('@deck.gl/core');
    const {tableFromArrays} = await import('apache-arrow');
    const {default: AnimatedArcLayer} =
      backend === 'webgpu'
        ? await import('../../../examples-v10/website/globe/animated-arc-layer')
        : await import('../../../examples-v10/website/maplibre/animated-arc-layer');
    const parent = document.createElement('div');
    document.body.appendChild(parent);
    const data = tableFromArrays({x: [-20], y: [20], start: [0], arrival: [10]});
    const layer = new AnimatedArcLayer({
      id: 'flight-time',
      data,
      getSourcePosition: {sql: 'FLOAT64x2(x, 0)'},
      getTargetPosition: {sql: 'FLOAT64x2(y, 0)'},
      getTimestamps: {sql: 'FLOAT32x2(start, arrival)'},
      getHeight: 0,
      getWidth: 14,
      timeRange: [0, 10],
      pickable: true
    });
    const errors: Error[] = [];
    const deck = new Deck({
      device: testDevice,
      parent,
      width: 128,
      height: 128,
      useDevicePixels: false,
      views: new OrthographicView(),
      initialViewState: {target: [0, 0, 0], zoom: 0},
      layers: [layer],
      onError: error => errors.push(error)
    });
    const waitForRender = (current: typeof layer) =>
      vi.waitFor(
        () => {
          expect(errors).toEqual([]);
          expect(current.state?.columns?.length).toBe(1);
          expect(current.isLoaded).toBe(true);
          deck.redraw('draw flight arcs');
        },
        {timeout: 5000}
      );
    try {
      await waitForRender(layer);
      expect((await deck.pickObjectAsync({x: 64, y: 64}))?.index).toBe(0);

      const hidden = layer.clone({timeRange: [20, 30]});
      deck.setProps({layers: [hidden]});
      await waitForRender(hidden);
      expect(await deck.pickObjectAsync({x: 64, y: 64})).toBeNull();
      expect(errors).toEqual([]);
    } finally {
      deck.finalize();
      parent.remove();
    }
  });
}
