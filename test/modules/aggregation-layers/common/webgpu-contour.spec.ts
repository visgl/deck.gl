// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {OrthographicView, WebMercatorViewport} from '@deck.gl/core';
import {ContourLayer, CPUAggregator} from '@deck.gl/aggregation-layers';
import {testLayerAsync} from '@deck.gl/test-utils/vitest';
import {WebGPUAggregator} from '../../../../modules/aggregation-layers/src/common/aggregator/webgpu-aggregator/webgpu-aggregator';

// Exercise reduction and marching squares without creating unrelated polygon/path models.
class ContourComputationLayer extends ContourLayer {
  static layerName = 'ContourComputationLayer';
  override renderLayers() {
    return null;
  }
}

for (const geospatial of [false, true]) {
  for (const operation of ['SUM', 'MEAN', 'MIN', 'MAX', 'COUNT'] as const) {
    test(`Contour compute matches CPU ${operation} (geospatial=${geospatial})`, async ({skip}) => {
      const device = await getWebGPUTestDevice();
      if (!device) return skip();
      let expected: unknown;
      await testLayerAsync({
        Layer: ContourComputationLayer,
        device,
        draw: false,
        viewport: geospatial
          ? new WebMercatorViewport({width: 200, height: 200, longitude: 0, latitude: 0, zoom: 0})
          : new OrthographicView().makeViewport({
              width: 200,
              height: 200,
              viewState: {target: [0, 0, 0], zoom: 0}
            }),
        onError: error => {
          throw error;
        },
        testCases: [false, true].map(gpuAggregation => ({
          props: {
            data: [
              {p: [-15, -5], w: 2},
              {p: [-14, -4], w: 4},
              {p: [5, 5], w: 3}
            ],
            getPosition: d => d.p,
            getWeight: d => d.w,
            cellSize: geospatial ? 1000000 : 10,
            aggregation: operation,
            contours: [{threshold: 1}, {threshold: [1, 5]}],
            gpuAggregation
          },
          async onAfterUpdate({layer}) {
            expect(layer.state.aggregator).toBeInstanceOf(
              gpuAggregation ? WebGPUAggregator : CPUAggregator
            );
            if (gpuAggregation)
              layer.draw({
                shaderModuleProps: {
                  project: {
                    viewport: layer.context.viewport,
                    coordinateSystem: geospatial ? 'lnglat' : 'cartesian',
                    coordinateOrigin: [0, 0, 0],
                    devicePixelRatio: 1
                  }
                }
              } as any);
            await vi.waitFor(() => expect(layer.state.aggregator.isLoaded).not.toBe(false), {
              timeout: 10000
            });
            const contours = (layer as any)._getContours();
            expect(contours).not.toBeNull();
            if (gpuAggregation) expect(contours).toEqual(expected);
            else expected = structuredClone(contours);
          }
        }))
      });
    });
  }
}

test('Contour compute reads borrowed GPU columns and updates row prefixes', async ({skip}) => {
  const device = await getWebGPUTestDevice();
  if (!device) return skip();
  const {Buffer} = await import('@luma.gl/core');
  const {GPUVector} = await import('@luma.gl/graph/gpu-data');
  const buffer = device.createBuffer({
    data: new Float32Array([1, 1, 2, 2, 2, 3]),
    usage: Buffer.STORAGE | Buffer.COPY_SRC
  });
  const positions = new GPUVector({
    type: 'buffer',
    name: 'positions',
    buffer,
    format: 'float32x2',
    length: 2,
    ownsBuffer: false
  });
  const weights = new GPUVector({
    type: 'buffer',
    name: 'weights',
    buffer,
    format: 'float32',
    byteOffset: 16,
    length: 2,
    ownsBuffer: false
  });
  try {
    await testLayerAsync({
      Layer: ContourComputationLayer,
      device,
      viewport: new OrthographicView().makeViewport({
        width: 100,
        height: 100,
        viewState: {target: [0, 0, 0], zoom: 0}
      }),
      onError: error => {
        throw error;
      },
      testCases: [2, 1, 0, 2].map(numInstances => ({
        props: {
          positions,
          weights: [weights],
          dataBounds: [
            [1, 1],
            [2, 2]
          ],
          cellSize: 10,
          numInstances,
          contours: [{threshold: 1}]
        },
        async onAfterUpdate({layer}) {
          expect(layer.state.aggregator).toBeInstanceOf(WebGPUAggregator);
          await vi.waitFor(() => expect(layer.state.aggregator.isLoaded).toBe(true), {
            timeout: 10000
          });
          expect(layer.state.aggregator.getResultDomain(0)).toEqual(
            numInstances ? [numInstances === 2 ? 5 : 2, numInstances === 2 ? 5 : 2] : [0, 0]
          );
          (layer as any)._getContours();
        }
      }))
    });
    expect(buffer.destroyed).toBe(false);
  } finally {
    positions.destroy();
    weights.destroy();
    buffer.destroy();
  }
});

test('Contour requests a redraw and recovers after a failed metadata readback', async ({skip}) => {
  const device = await getWebGPUTestDevice();
  if (!device) return skip();
  const {LayerManager} = await import('@deck.gl/core');
  const viewport = new OrthographicView().makeViewport({
    width: 100,
    height: 100,
    viewState: {target: [0, 0, 0], zoom: 0}
  });
  const manager = new LayerManager(device, {viewport});
  const layer = new ContourComputationLayer({data: [[1, 1]], getPosition: p => p, cellSize: 10});
  const draw = () =>
    layer.draw({
      shaderModuleProps: {
        project: {
          viewport,
          coordinateSystem: 'cartesian',
          coordinateOrigin: [0, 0, 0],
          devicePixelRatio: 1
        }
      }
    } as any);
  try {
    manager.setLayers([layer]);
    draw();
    await vi.waitFor(() => expect(layer.state.aggregator.isLoaded).toBe(true), {timeout: 10000});
    const aggregator = layer.state.aggregator;
    const redraw = vi.spyOn(layer, 'setNeedsRedraw');
    const onError = vi.fn();
    const read = vi
      .spyOn((aggregator as any).valueBuffer, 'readAsync')
      .mockRejectedValueOnce(new Error('transient mapping failure'));
    aggregator.setProps({onError});
    aggregator.setNeedsUpdate();
    draw();
    await vi.waitFor(() => expect(onError).toHaveBeenCalledOnce(), {timeout: 10000});
    expect(redraw).toHaveBeenCalledOnce();
    expect(aggregator.isLoaded).toBe(false);
    draw();
    await vi.waitFor(() => expect(aggregator.isLoaded).toBe(true), {timeout: 10000});
    expect(aggregator.getResultDomain(0)).toEqual([1, 1]);
    expect((layer as any)._getContours()).not.toBeNull();
    read.mockRestore();
    redraw.mockRestore();
  } finally {
    manager.finalize();
  }
});

test('Contour keeps completed geometry and its transform while new bins are pending', async ({
  skip
}) => {
  const device = await getWebGPUTestDevice();
  if (!device) return skip();
  const {LayerManager} = await import('@deck.gl/core');
  const viewport = new OrthographicView().makeViewport({
    width: 100,
    height: 100,
    viewState: {target: [0, 0, 0], zoom: 0}
  });
  const manager = new LayerManager(device, {viewport});
  let layer = new ContourComputationLayer({
    id: 'retained-contours',
    data: [
      [1, 1],
      [21, 21]
    ],
    getPosition: p => p,
    cellSize: 10,
    contours: [{threshold: 0.5}, {threshold: [0.5, 2]}]
  });
  const draw = () =>
    layer.draw({
      shaderModuleProps: {
        project: {
          viewport,
          coordinateSystem: 'cartesian',
          coordinateOrigin: [0, 0, 0],
          devicePixelRatio: 1
        }
      }
    } as any);
  try {
    manager.setLayers([layer]);
    draw();
    await vi.waitFor(() => expect(layer.state.aggregator.isLoaded).toBe(true), {timeout: 10000});
    for (const cellSize of [20, 5]) {
      const previous = (layer as any)._getContours();
      const previousLayers = ContourLayer.prototype.renderLayers.call(layer) as any[];
      expect(previousLayers.filter(Boolean)).toHaveLength(2);
      layer = layer.clone({cellSize});
      manager.setLayers([layer]);
      expect(layer.state.aggregator.isLoaded).toBe(false);
      expect((layer as any)._getContours()).toBe(previous);
      const pendingLayers = ContourLayer.prototype.renderLayers.call(layer) as any[];
      expect(pendingLayers.filter(Boolean)).toHaveLength(2);
      expect(Array.from(pendingLayers[0].props.modelMatrix)).toEqual(
        Array.from(previousLayers[0].props.modelMatrix)
      );
      draw();
      expect((layer as any)._getContours()).toBe(previous);
      await vi.waitFor(() => expect(layer.state.aggregator.isLoaded).toBe(true), {timeout: 10000});
      expect((layer as any)._getContours()).not.toBe(previous);
      expect(layer.state.contourFrame!.size).toEqual(layer.state.cellSizeCommon);
    }
  } finally {
    manager.finalize();
  }
});
