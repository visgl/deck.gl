// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {Buffer} from '@luma.gl/core';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {GPUVector} from '@luma.gl/graph/gpu-data';
import {ReadbackAggregator, GridLayer} from '@deck.gl/aggregation-layers';
import {OrthographicView} from '@deck.gl/core';
import {testLayerAsync} from '@deck.gl/test-utils/vitest';

test('Readback aggregation preserves strided columns, prefixes, and ownership', async ({skip}) => {
  const device = await getWebGPUTestDevice();
  if (!device) return skip();
  const buffer = device.createBuffer({
    data: new Float32Array([999, 999, 999, 999, 0, 0, 2, 99, 1, 0, 3, 99]),
    usage: Buffer.COPY_SRC | Buffer.COPY_DST
  });
  const positions = new GPUVector({
    type: 'buffer',
    name: 'positions',
    buffer,
    format: 'float32x2',
    length: 2,
    byteOffset: 16,
    byteStride: 16,
    ownsBuffer: false
  });
  const weight = new GPUVector({
    type: 'buffer',
    name: 'weights',
    buffer,
    format: 'float32',
    length: 2,
    byteOffset: 24,
    byteStride: 16,
    ownsBuffer: false
  });
  const onUpdate = vi.fn();
  const aggregator = new ReadbackAggregator({
    dimensions: 1,
    weightAttributes: ['weights'],
    getBin: {sources: ['positions'], getValue: ({positions}) => [Math.floor(positions[0] / 10)]},
    getValue: [{sources: ['weights'], getValue: ({weights}) => weights}]
  });
  aggregator.initialize(device);
  try {
    aggregator.setProps({
      positions,
      weights: [weight],
      pointCount: 2,
      operations: ['SUM'],
      onUpdate
    });
    const createBuffer = vi.spyOn(device, 'createBuffer');
    aggregator.update();
    expect(aggregator.isLoaded).toBe(false);
    await vi.waitFor(() => expect(aggregator.isLoaded).toBe(true));
    expect(aggregator.getBin(0)).toMatchObject({value: [5], count: 2, pointIndices: [0, 1]});
    expect(createBuffer).not.toHaveBeenCalled();
    createBuffer.mockRestore();
    for (const count of [1, 0, 2]) {
      aggregator.setProps({pointCount: count});
      aggregator.update();
      await vi.waitFor(() => expect(aggregator.isLoaded).toBe(true));
      expect(aggregator.binCount).toBe(count ? 1 : 0);
      if (count) expect(aggregator.getBin(0)!.value).toEqual([count === 1 ? 2 : 5]);
    }
    const createLayerAggregator = () =>
      new ReadbackAggregator({
        dimensions: 2,
        weightAttributes: ['colorWeights', 'elevationWeights'],
        getBin: {
          sources: ['positions'],
          getValue: ({positions}, index, {cellSizeCommon, cellOriginCommon}) =>
            positions
              .slice(0, 2)
              .map((value, axis) =>
                Math.floor((value - cellOriginCommon[axis]) / cellSizeCommon[axis])
              )
        },
        getValue: [
          {sources: ['colorWeights'], getValue: ({colorWeights}) => colorWeights},
          {sources: ['elevationWeights'], getValue: ({elevationWeights}) => elevationWeights}
        ]
      });
    await testLayerAsync({
      Layer: GridLayer,
      device,
      viewport: new OrthographicView().makeViewport({
        width: 100,
        height: 100,
        viewState: {target: [0, 0, 0], zoom: 0}
      }),
      onError: error => {
        throw error;
      },
      testCases: [createLayerAggregator(), null, createLayerAggregator()].map(layerAggregator => ({
        props: {
          positions,
          weights: [weight, weight],
          dataBounds: [
            [0, 0],
            [1, 0]
          ],
          cellSize: 10,
          colorDomain: [0, 10],
          elevationDomain: [0, 10],
          aggregator: layerAggregator,
          pickable: true
        },
        async onAfterUpdate({layer}) {
          await vi.waitFor(() => expect(layer.state.aggregator.isLoaded).toBe(true));
          expect(layer.state.aggregator.getBin(0)).toMatchObject({value: [5, 5], count: 2});
          expect(layer.state.aggregator.getResultDomain(0)).toEqual([5, 5]);
        }
      }))
    });
    const snapshot = await buffer.readAsync();
    const read = vi.spyOn(buffer, 'readAsync');
    let finish!: (value: Uint8Array) => void;
    read.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          finish = resolve;
        })
    );
    aggregator.setNeedsUpdate();
    aggregator.update();
    read.mockResolvedValueOnce(snapshot);
    aggregator.setProps({pointCount: 1});
    aggregator.update();
    await vi.waitFor(() => expect(aggregator.isLoaded).toBe(true));
    const calls = onUpdate.mock.calls.length;
    finish(new Uint8Array(buffer.byteLength));
    await Promise.resolve();
    await Promise.resolve();
    expect(onUpdate.mock.calls.length).toBe(calls);
    expect(aggregator.getBin(0)!.value).toEqual([2]);
    const onError = vi.fn();
    read
      .mockRejectedValueOnce(new Error('mapping failed'))
      .mockRejectedValueOnce(new Error('retry failed'));
    aggregator.setProps({onError});
    aggregator.setNeedsUpdate();
    aggregator.update();
    await vi.waitFor(() => expect(onError).toHaveBeenCalledTimes(2));
    expect(aggregator.isLoaded).toBe(false);
    // A later update retries without invalidating or changing the input revision.
    aggregator.update();
    await vi.waitFor(() => expect(aggregator.isLoaded).toBe(true));
    // A single transient copy failure also recovers without another layer update.
    read.mockRejectedValueOnce(new Error('transient mapping failure'));
    aggregator.setNeedsUpdate();
    aggregator.update();
    await vi.waitFor(() => expect(onError).toHaveBeenCalledTimes(3));
    await vi.waitFor(() => expect(aggregator.isLoaded).toBe(true));
    const getValue = aggregator.props.getValue[0].getValue;
    aggregator.props.getValue[0].getValue = () => {
      throw new Error('CPU callback failed');
    };
    onUpdate.mockClear();
    aggregator.setNeedsUpdate();
    aggregator.update();
    await vi.waitFor(() => expect(onError).toHaveBeenCalledTimes(4));
    expect(aggregator.isLoaded).toBe(false);
    expect(onUpdate).not.toHaveBeenCalled();
    aggregator.props.getValue[0].getValue = getValue;
    aggregator.update();
    await vi.waitFor(() => expect(aggregator.isLoaded).toBe(true));
    expect(aggregator.getBin(0)!.value).toEqual([2]);
    read.mockRestore();
  } finally {
    aggregator.destroy();
    expect(() => aggregator.update()).toThrow(/destroyed/);
    expect(buffer.destroyed).toBe(false);
    positions.destroy();
    weight.destroy();
    buffer.destroy();
  }
});
