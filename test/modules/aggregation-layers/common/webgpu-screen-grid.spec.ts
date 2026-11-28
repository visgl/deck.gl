// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {Buffer} from '@luma.gl/core';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {GPUVector, getGPUVectorData} from '@luma.gl/graph/gpu-data';
import {OrthographicView} from '@deck.gl/core';
import {WebGPUScreenGridAggregator} from '../../../../modules/aggregation-layers/src/screen-grid-layer/webgpu-screen-grid-aggregator';

test('WebGPU ScreenGrid reductions stay on GPU and recover from empty input', async ({skip}) => {
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
  const aggregator = new WebGPUScreenGridAggregator(device);
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
  } finally {
    expect(await device.handle.popErrorScope()).toBeNull();
    aggregator.destroy();
    positions.destroy();
    weights.destroy();
    buffer.destroy();
    weightBuffer.destroy();
  }
});

test('ScreenGridLayer selects compute aggregation and renders its vectors', async ({skip}) => {
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
          expect(layer.state.aggregator).toBeInstanceOf(WebGPUScreenGridAggregator);
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
          expect(layer.state.aggregator).toBeInstanceOf(WebGPUScreenGridAggregator);
          await vi.waitFor(() => expect(layer.state.aggregator.getResultValues(0)).not.toBeNull(), {
            timeout: 10000
          });
        }
      }
    ]
  });
  expect(result).toBeTruthy();
  expect(await device.handle.popErrorScope()).toBeNull();
});

test('ScreenGridLayer accepts GPU columns and updates prefixes without readback', async ({
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
          expect(layer.state.aggregator).toBeInstanceOf(WebGPUScreenGridAggregator);
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
