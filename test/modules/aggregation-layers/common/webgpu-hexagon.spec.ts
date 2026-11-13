// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {Buffer} from '@luma.gl/core';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {GPUVector, getGPUVectorData} from '@luma.gl/graph/gpu-data';
import {OrthographicView, WebMercatorViewport} from '@deck.gl/core';
import {HexagonLayer, CPUAggregator} from '@deck.gl/aggregation-layers';
import {testLayerAsync} from '@deck.gl/test-utils/vitest';
import {WebGPUHexagonAggregator} from '../../../../modules/aggregation-layers/src/hexagon-layer/webgpu-hexagon-aggregator';

async function readVector(vector: GPUVector): Promise<number[]> {
  const data = getGPUVectorData(vector);
  const bytes = await data.buffer.readAsync();
  const values = new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4);
  const size = vector.format === 'float32x2' ? 2 : 1;
  const result: number[] = [];
  for (let i = 0; i < vector.length; i++) {
    for (let j = 0; j < size; j++)
      result.push(values[data.byteOffset / 4 + (i * data.byteStride) / 4 + j]);
  }
  return result;
}

for (const geospatial of [false, true]) {
  test(`Hexagon compute matches CPU bins and two-channel values (geospatial=${geospatial})`, async ({
    skip
  }) => {
    const device = await getWebGPUTestDevice();
    if (!device) return skip();
    device.handle.pushErrorScope('validation');
    const viewport = geospatial
      ? new WebMercatorViewport({width: 200, height: 200, longitude: -122, latitude: 38, zoom: 10})
      : new OrthographicView().makeViewport({
          width: 200,
          height: 200,
          viewState: {target: [0, 0, 0], zoom: 0}
        });
    const positions = geospatial
      ? [
          [-122.01, 37.99],
          [-122, 38],
          [-121.9999, 38.0001],
          [-121.99, 38.01]
        ]
      : [
          [-24, -16],
          [4, 4],
          [6, 6],
          [24, 16]
        ];
    const data = positions.map((position, i) => ({
      position,
      color: [2, -3, 5, 7][i],
      elevation: [10, 20, -40, 80][i]
    }));
    const initial = {
      data,
      getPosition: d => d.position,
      getColorWeight: d => d.color,
      getElevationWeight: d => d.elevation,
      radius: geospatial ? 1000 : 10,
      colorDomain: [-10, 20],
      elevationDomain: [-50, 100],
      colorAggregation: 'SUM',
      elevationAggregation: 'MEAN'
    };
    const changes = [
      {},
      {colorAggregation: 'MIN', elevationAggregation: 'MAX'},
      {colorAggregation: 'COUNT', elevationAggregation: 'SUM'},
      {colorAggregation: 'COUNT', elevationAggregation: 'COUNT'},
      {
        getColorWeight: 4,
        getElevationWeight: -2,
        updateTriggers: {getColorWeight: 1, getElevationWeight: 1}
      },
      {radius: geospatial ? 2000 : 20},
      {data: []},
      {data, colorAggregation: 'MAX', elevationAggregation: 'MIN'}
    ];
    const expected: Map<string, number[]>[] = [];
    for (const gpuAggregation of [false, true]) {
      await testLayerAsync({
        Layer: HexagonLayer,
        device,
        viewport,
        onError: error => {
          throw error;
        },
        testCases: changes.map((change, index) => ({
          ...(index === 0 ? {props: {...initial, gpuAggregation}} : {}),
          updateProps: change,
          async onAfterUpdate({layer, subLayer}) {
            const aggregator = layer.state.aggregator;
            if (!gpuAggregation) {
              expect(aggregator).toBeInstanceOf(CPUAggregator);
              const bins = new Map<string, number[]>();
              for (let i = 0; i < aggregator.binCount; i++) {
                const bin = aggregator.getBin(i)!;
                bins.set(bin.id.join(','), bin.value);
              }
              expected[index] = bins;
              return;
            }
            expect(aggregator).toBeInstanceOf(WebGPUHexagonAggregator);
            const ids = await readVector(aggregator.getBins()!);
            const colors = await readVector(aggregator.getResult(0)!);
            const elevations = await readVector(aggregator.getResult(1)!);
            expect(getGPUVectorData(aggregator.getResult(0)!).buffer).toBe(
              getGPUVectorData(aggregator.getResult(1)!).buffer
            );
            const found = new Set<string>();
            for (let i = 0; i < aggregator.binCount; i++) {
              const key = ids.slice(i * 2, i * 2 + 2).join(',');
              const values = expected[index].get(key);
              if (values) {
                found.add(key);
                expect(colors[i], `color bin ${key}`).toBeCloseTo(values[0], 4);
                expect(elevations[i], `elevation bin ${key}`).toBeCloseTo(values[1], 4);
              } else {
                expect(colors[i]).toBeNaN();
                expect(elevations[i]).toBeNaN();
              }
            }
            expect(found.size).toBe(expected[index].size);
            if (subLayer) {
              expect(subLayer.props.data.attributes.getColorValue).toBe(aggregator.getResult(0));
              expect(subLayer.props.data.attributes.getElevationValue).toBe(
                aggregator.getResult(1)
              );
            }
          }
        }))
      });
    }
    expect(await device.handle.popErrorScope()).toBeNull();
  });
}

test('Hexagon GPU columns share two-channel output and update prefixes', async ({skip}) => {
  const device = await getWebGPUTestDevice();
  if (!device) return skip();
  device.handle.pushErrorScope('validation');
  const buffer = device.createBuffer({
    data: new Float32Array([-24, -16, 2, 10, 4, 4, -3, 20, 6, 6, 5, -40, 24, 16, 7, 80]),
    usage: Buffer.COPY_SRC | Buffer.COPY_DST
  });
  const vectors = [0, 8, 12].map(
    (byteOffset, index) =>
      new GPUVector({
        type: 'buffer',
        name: `column${index}`,
        buffer,
        length: 4,
        format: index === 0 ? 'float32x2' : 'float32',
        byteOffset,
        byteStride: 16,
        ownsBuffer: false
      })
  );
  let previousResult: GPUVector | null = null;
  try {
    await testLayerAsync({
      Layer: HexagonLayer,
      device,
      viewport: new OrthographicView().makeViewport({
        width: 200,
        height: 200,
        viewState: {target: [0, 0, 0], zoom: 0}
      }),
      onError: error => {
        throw error;
      },
      testCases: [4, 2, 0, 4].map((count, index) => ({
        ...(index === 0
          ? {
              props: {
                data: {attributes: {getColorWeight: new Uint8Array([255])}},
                positions: vectors[0],
                weights: vectors.slice(1),
                dataBounds: [
                  [-24, -16],
                  [24, 16]
                ],
                radius: 10,
                colorDomain: [-10, 20],
                elevationDomain: [-50, 100],
                colorAggregation: 'SUM',
                elevationAggregation: 'SUM',
                getPosition: () => {
                  throw new Error('Accessor called');
                }
              }
            }
          : {}),
        updateProps: {numInstances: count},
        async onAfterUpdate({layer, subLayer}) {
          const aggregator = layer.state.aggregator;
          expect(aggregator).toBeInstanceOf(WebGPUHexagonAggregator);
          const result = aggregator.getResult(0)!;
          if (previousResult) expect(result).toBe(previousResult);
          previousResult = result;
          const colors = await readVector(result);
          const elevations = await readVector(aggregator.getResult(1)!);
          const sum = (values: number[]) =>
            values.filter(Number.isFinite).reduce((a, b) => a + b, 0);
          expect(sum(colors)).toBe(count === 4 ? 11 : count === 2 ? -1 : 0);
          expect(sum(elevations)).toBe(count === 4 ? 70 : count === 2 ? 30 : 0);
          expect(getGPUVectorData(result).buffer).toBe(
            getGPUVectorData(aggregator.getResult(1)!).buffer
          );
          expect(subLayer.props.data.attributes.getColorValue).toBe(result);
          expect(subLayer.props.data.attributes.getElevationValue).toBe(aggregator.getResult(1));
        }
      }))
    });
    expect(buffer.destroyed).toBe(false);
  } finally {
    for (const vector of vectors) vector.destroy();
    buffer.destroy();
    expect(await device.handle.popErrorScope()).toBeNull();
  }
});

test('Hexagon retains CPU aggregation for quantile elevation and integer weights', async ({
  skip
}) => {
  const device = await getWebGPUTestDevice();
  if (!device) return skip();
  await testLayerAsync({
    Layer: HexagonLayer,
    device,
    onError: error => {
      throw error;
    },
    testCases: [
      {
        props: {
          data: [[0, 0]],
          getPosition: d => d,
          colorDomain: [0, 10],
          elevationDomain: [0, 10],
          elevationScaleType: 'quantile'
        },
        onAfterUpdate({layer}) {
          expect(layer.state.aggregator).toBeInstanceOf(CPUAggregator);
        }
      },
      {
        updateProps: {
          elevationScaleType: 'linear',
          data: {
            length: 1,
            attributes: {
              getPosition: {value: new Float32Array([0, 0, 0]), size: 3},
              getColorWeight: {value: new Int32Array([2]), size: 1},
              getElevationWeight: {value: new Int32Array([3]), size: 1}
            }
          }
        },
        onAfterUpdate({layer}) {
          expect(layer.state.aggregator).toBeInstanceOf(CPUAggregator);
        }
      },
      {
        updateProps: {opacity: 0.5, colorDomain: [0, 20]},
        onAfterUpdate({layer}) {
          expect(layer.state.aggregator).toBeInstanceOf(CPUAggregator);
        }
      }
    ]
  });
});
