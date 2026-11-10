// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {Buffer} from '@luma.gl/core';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {GPUVector, getGPUVectorData} from '@luma.gl/graph/gpu-data';
import {OrthographicView} from '@deck.gl/core';
import {GraphScreenGridAggregator} from '@deck.gl/aggregation-layers';
import {createTestViewport} from '../../core/viewports/test-crs';
import {WebGPUScreenGridAggregator} from '../../../../modules/aggregation-layers/src/screen-grid-layer/webgpu-screen-grid-aggregator';

test('Graph ScreenGrid reductions stay on GPU and recover from empty input', async ({skip}) => {
  const device = await getWebGPUTestDevice();
  if (!device) return skip();
  device.handle.pushErrorScope('validation');
  const buffer = device.createBuffer({
    data: new Float32Array([0, 0, 0, 10, 10, 0, 1000, 1000, 0]),
    usage: Buffer.STORAGE | Buffer.COPY_DST
  });
  const weightBuffer = device.createBuffer({
    data: new Float32Array([99, 2, 99, 6, 99, 100]),
    usage: Buffer.COPY_SRC | Buffer.COPY_DST
  });
  const positions = new GPUVector({
    type: 'buffer',
    name: 'positions',
    buffer,
    format: 'float32x3',
    length: 3,
    ownsBuffer: false
  });
  const weights = new GPUVector({
    type: 'buffer',
    name: 'weights',
    buffer: weightBuffer,
    format: 'float32',
    byteOffset: 4,
    byteStride: 8,
    length: 3,
    ownsBuffer: false
  });
  const aggregator = new GraphScreenGridAggregator();
  aggregator.initialize(device);
  const viewport = new OrthographicView().makeViewport({
    width: 100,
    height: 100,
    viewState: {target: [0, 0, 0], zoom: 0}
  });
  try {
    aggregator.setProps({
      positions,
      weights: [weights],
      pointCount: 3,
      binIdRange: [
        [0, 1],
        [0, 1]
      ],
      binOptions: {cellSizePixels: 100},
      shaderModuleProps: {
        project: {
          viewport,
          devicePixelRatio: 1,
          coordinateSystem: 'cartesian',
          coordinateOrigin: [0, 0, 0],
          modelMatrix: null
        }
      }
    });
    for (const [operation, expected] of [
      ['SUM', 8],
      ['MEAN', 4],
      ['MIN', 2],
      ['MAX', 6],
      ['COUNT', 2]
    ] as const) {
      aggregator.setProps({operations: [operation]});
      aggregator.update();
      aggregator.preDraw();
      const values = new Float32Array(
        (await getGPUVectorData(aggregator.getResult(0)!).buffer.readAsync()).buffer
      );
      expect(values[0], operation).toBe(expected);
    }
    const output = aggregator.getResult(0)!;
    const outputBuffer = getGPUVectorData(output).buffer;
    output.destroy();
    expect(outputBuffer.destroyed).toBe(false);
    expect(aggregator.getResult(0)).toBe(output);
    aggregator.setProps({pointCount: 0, operations: ['SUM']});
    aggregator.preDraw();
    expect(
      new Float32Array(
        (await getGPUVectorData(aggregator.getResult(0)!).buffer.readAsync()).buffer
      )[0]
    ).toBeNaN();
    aggregator.setProps({pointCount: 1});
    aggregator.preDraw();
    expect(
      new Float32Array(
        (await getGPUVectorData(aggregator.getResult(0)!).buffer.readAsync()).buffer
      )[0]
    ).toBe(2);
    aggregator.setProps({
      binIdRange: [
        [0, 0],
        [0, 0]
      ]
    });
    aggregator.preDraw();
    expect(aggregator.getResult(0)!.length).toBe(0);
    aggregator.setProps({
      binIdRange: [
        [0, 2],
        [0, 2]
      ],
      binOptions: {cellSizePixels: 50},
      pointCount: 2
    });
    aggregator.preDraw();
    expect(
      Array.from(
        new Float32Array((await getGPUVectorData(aggregator.getBins()!).buffer.readAsync()).buffer)
      )
    ).toEqual([0, 0, 1, 0, 0, 1, 1, 1]);
    const movedViewport = new OrthographicView().makeViewport({
      width: 100,
      height: 100,
      viewState: {target: [1000, 1000, 0], zoom: 0}
    });
    aggregator.setProps({
      shaderModuleProps: {
        project: {
          viewport: movedViewport,
          devicePixelRatio: 1,
          coordinateSystem: 'cartesian',
          coordinateOrigin: [0, 0, 0],
          modelMatrix: null
        }
      }
    });
    aggregator.setNeedsUpdate();
    aggregator.preDraw();
    expect(
      Array.from(
        new Float32Array(
          (await getGPUVectorData(aggregator.getResult(0)!).buffer.readAsync()).buffer
        )
      ).every(Number.isNaN)
    ).toBe(true);
    const onError = vi.fn();
    const onNeedsRedraw = vi.fn();
    vi.spyOn(getGPUVectorData(aggregator.getResult(0)!).buffer, 'readAsync').mockRejectedValueOnce(
      new Error('transient map failure')
    );
    aggregator.setProps({readback: true, onError, onNeedsRedraw});
    aggregator.preDraw();
    await vi.waitFor(() => expect(onNeedsRedraw).toHaveBeenCalledTimes(1));
    expect(onError).toHaveBeenCalledTimes(1);
    expect(aggregator.isLoaded).toBe(false);
    aggregator.preDraw();
    await vi.waitFor(() => expect(aggregator.isLoaded).toBe(true));
    expect(aggregator.getResultDomain(0)).toEqual([0, 0]);
  } finally {
    expect(await device.handle.popErrorScope()).toBeNull();
    aggregator.destroy();
    positions.destroy();
    weights.destroy();
    buffer.destroy();
    weightBuffer.destroy();
  }
});

test('Graph ScreenGridLayer selects compute aggregation and renders its vectors', async ({
  skip
}) => {
  const device = await getWebGPUTestDevice();
  if (!device) return skip();
  device.handle.pushErrorScope('validation');
  const {ScreenGridLayer} = await import('@deck.gl/aggregation-layers');
  const {testLayerAsync} = await import('@deck.gl/test-utils/vitest');
  const viewport = new OrthographicView().makeViewport({
    width: 100,
    height: 100,
    viewState: {target: [0, 0, 0], zoom: 0}
  });
  let result: GPUVector | null = null;
  const graphAggregator = new GraphScreenGridAggregator();
  const destroy = vi.spyOn(graphAggregator, 'destroy');
  await testLayerAsync({
    Layer: ScreenGridLayer,
    device,
    viewport,
    onError: error => {
      throw error;
    },
    testCases: [
      {
        props: {
          aggregator: graphAggregator,
          data: [
            [0, 0, 0],
            [10, 10, 0]
          ],
          getPosition: p => p,
          getWeight: 2,
          colorDomain: [0, 10],
          cellSizePixels: 100
        },
        async onAfterUpdate({layer, subLayer}) {
          expect(layer.state.aggregator).toBeInstanceOf(GraphScreenGridAggregator);
          expect(subLayer.props.data.attributes.getWeight).toBeInstanceOf(GPUVector);
          result = layer.state.aggregator.getResult(0);
          expect(
            new Float32Array((await getGPUVectorData(result!).buffer.readAsync()).buffer)[0]
          ).toBe(4);
        }
      },
      {
        updateProps: {pickable: true},
        async onAfterUpdate({layer}) {
          expect(layer.state.aggregator).toBeInstanceOf(GraphScreenGridAggregator);
          await vi.waitFor(() => expect(layer.state.aggregator.getResultValues(0)).not.toBeNull(), {
            timeout: 10000
          });
          expect(layer.state.aggregator.getResultDomain(0)).toEqual([4, 4]);
          expect(layer.state.aggregator.getBin(0)).toEqual({id: [0, 0], value: [4], count: 2});
        }
      },
      {
        updateProps: {aggregator: null},
        async onAfterUpdate({layer}) {
          expect(layer.state.aggregator).toBeInstanceOf(WebGPUScreenGridAggregator);
          expect(destroy).toHaveBeenCalledTimes(1);
        }
      }
    ]
  });
  expect(result).toBeTruthy();
  expect(await device.handle.popErrorScope()).toBeNull();
});

test('Graph ScreenGridLayer accepts GPU columns and updates prefixes without readback', async ({
  skip
}) => {
  const device = await getWebGPUTestDevice();
  if (!device) return skip();
  const {ScreenGridLayer} = await import('@deck.gl/aggregation-layers');
  const {testLayerAsync} = await import('@deck.gl/test-utils/vitest');
  device.handle.pushErrorScope('validation');
  const buffer = device.createBuffer({
    data: new Float32Array([0, 0, 10, 10, 2, 6]),
    usage: Buffer.STORAGE | Buffer.COPY_DST
  });
  const positions = new GPUVector({
    type: 'buffer',
    name: 'positions',
    format: 'float32x2',
    length: 2,
    buffer,
    ownsBuffer: false
  });
  const weights = new GPUVector({
    type: 'buffer',
    name: 'weights',
    format: 'float32',
    length: 2,
    byteOffset: 16,
    buffer,
    ownsBuffer: false
  });
  try {
    await testLayerAsync({
      Layer: ScreenGridLayer,
      device,
      viewport: new OrthographicView().makeViewport({
        width: 100,
        height: 100,
        viewState: {target: [0, 0, 0], zoom: 0}
      }),
      onError: error => {
        throw error;
      },
      testCases: [2, 1, 0, 2].map((count, i) => ({
        ...(i === 0
          ? {
              props: {
                aggregator: new GraphScreenGridAggregator(),
                data: {attributes: {getWeight: new Uint8Array([255])}},
                positions,
                weights: [weights],
                colorDomain: [0, 10],
                cellSizePixels: 100,
                getPosition: () => {
                  throw new Error('Accessor called');
                }
              }
            }
          : {}),
        updateProps: {numInstances: count},
        async onAfterUpdate({layer}) {
          expect(layer.state.aggregator).toBeInstanceOf(GraphScreenGridAggregator);
          const result = layer.state.aggregator.getResult(0)!;
          const value = new Float32Array(
            (await getGPUVectorData(result).buffer.readAsync()).buffer
          )[0];
          if (count) expect(value).toBe(count === 2 ? 8 : 2);
          else expect(value).toBeNaN();
        }
      }))
    });
    expect(buffer.destroyed).toBe(false);
  } finally {
    positions.destroy();
    weights.destroy();
    buffer.destroy();
  }
  expect(await device.handle.popErrorScope()).toBeNull();
});

test('Graph aggregator rejects unsupported devices and destroyed reuse', () => {
  const aggregator = new GraphScreenGridAggregator();
  expect(() => aggregator.initialize({type: 'webgl'} as any)).toThrow('requires WebGPU');
  aggregator.destroy();
  expect(() => aggregator.initialize({type: 'webgpu'} as any)).toThrow('has been destroyed');
});

test('Graph aggregation rejects shader extensions when adopted by a layer', async ({skip}) => {
  const device = await getWebGPUTestDevice();
  if (!device) return skip();
  const {LayerManager} = await import('@deck.gl/core');
  const {ScreenGridLayer} = await import('@deck.gl/aggregation-layers');
  const {DataFilterExtension} = await import('@deck.gl/extensions');
  const errors: Error[] = [];
  const manager = new LayerManager(device, {
    viewport: new OrthographicView().makeViewport({
      width: 100,
      height: 100,
      viewState: {target: [0, 0, 0], zoom: 0}
    })
  });
  try {
    manager.setProps({onError: error => errors.push(error)});
    manager.setLayers([
      new ScreenGridLayer({
        data: [],
        aggregator: new GraphScreenGridAggregator(),
        extensions: [new DataFilterExtension()]
      })
    ]);
    expect(errors.some(error => error.message.includes('does not support shader extensions'))).toBe(
      true
    );
  } finally {
    manager.finalize();
  }
});

test('Graph aggregation rejects borrowed positions that require CPU preprojection', async ({
  skip
}) => {
  const device = await getWebGPUTestDevice();
  if (!device) return skip();
  const {LayerManager} = await import('@deck.gl/core');
  const {ScreenGridLayer} = await import('@deck.gl/aggregation-layers');
  const buffer = device.createBuffer({data: new Float32Array([1, 2, 0, 1]), usage: Buffer.STORAGE});
  const positions = new GPUVector({
    type: 'buffer',
    name: 'positions',
    format: 'float32x3',
    length: 1,
    buffer,
    ownsBuffer: false
  });
  const weights = new GPUVector({
    type: 'buffer',
    name: 'weights',
    format: 'float32',
    byteOffset: 12,
    length: 1,
    buffer,
    ownsBuffer: false
  });
  const viewport = createTestViewport({
    width: 100,
    height: 100,
    converter: {forward: p => p.map(v => v * 2), inverse: p => p.map(v => v / 2)}
  });
  try {
    for (const coordinateSystem of ['default', 'cartesian'] as const) {
      const errors: Error[] = [];
      const manager = new LayerManager(device, {viewport});
      const layer = new ScreenGridLayer({
        data: [],
        positions,
        weights: [weights],
        colorDomain: [0, 10],
        coordinateSystem,
        aggregator: new GraphScreenGridAggregator()
      });
      try {
        manager.setProps({onError: error => errors.push(error)});
        manager.setLayers([layer]);
        if (coordinateSystem === 'default') {
          expect(layer.state.preproject).toBeTypeOf('function');
          expect(
            errors.some(error => error.message.includes('custom view coordinate system'))
          ).toBe(true);
        } else {
          expect(layer.state.preproject).toBeNull();
          expect(errors).toEqual([]);
        }
      } finally {
        manager.finalize();
      }
      expect(buffer.destroyed).toBe(false);
    }
  } finally {
    positions.destroy();
    weights.destroy();
    buffer.destroy();
  }
});
