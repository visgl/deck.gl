// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';

import * as FIXTURES from 'deck.gl-test/data';

import {testLayer, testLayerAsync, generateLayerTests, device} from '@deck.gl/test-utils/vitest';

import {LayerManager, MapView} from '@deck.gl/core';
import {LineLayer, PathLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {ContourLayer} from '@deck.gl/aggregation-layers';
import {PathStyleExtension} from '@deck.gl/extensions';
import {getGPUVectorData} from '@luma.gl/graph/gpu-data';
import {generateContours} from '../../../../modules/aggregation-layers/src/contour-layer/contour-utils';
import {WebGPUAggregator} from '../../../../modules/aggregation-layers/src/common/aggregator/webgpu-aggregator/webgpu-aggregator';
import type {ContourLayerProps} from '@deck.gl/aggregation-layers';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
const webglTest = device.type === 'webgl' ? test : test.skip;

const getPosition = d => d.COORDINATES;
const CONTOURS: ContourLayerProps['contours'] = [
  {threshold: 1, color: [255, 0, 0]}, // => Isoline for threshold 1
  {threshold: 5, color: [0, 255, 0]}, // => Isoline for threshold 5
  {threshold: [6, 10], color: [0, 0, 255]} // => Isoband for threshold range [6, 10)
];

test('ContourLayer#WebGPU renders isolines and isobands with compute aggregation', async ({
  skip
}) => {
  const webgpuDevice = await getWebGPUTestDevice();

  if (!webgpuDevice) {
    skip();
    return;
  }

  const viewport = new MapView().makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: -122, latitude: 38, zoom: 10}
  });
  const errors: Error[] = [];
  const layerManager = new LayerManager(webgpuDevice, {viewport});
  layerManager.setProps({onError: error => errors.push(error)});

  const layer = new ContourLayer({
    id: 'webgpu-contours',
    data: FIXTURES.points,
    getPosition,
    gpuAggregation: true,
    contours: CONTOURS,
    extensions: [new PathStyleExtension({dash: true})],
    cellSize: 200
  });

  webgpuDevice.handle.pushErrorScope('validation');
  layerManager.setLayers([layer]);

  expect(errors).toEqual([]);
  expect(layer.state.aggregator).toBeInstanceOf(WebGPUAggregator);
  await vi.waitFor(
    () => {
      layer.draw({
        shaderModuleProps: {
          project: {
            viewport,
            coordinateSystem: 'lnglat',
            coordinateOrigin: [0, 0, 0],
            devicePixelRatio: 1
          }
        }
      } as any);
      expect(layer.state.aggregator.isLoaded).toBe(true);
    },
    {timeout: 10000}
  );
  layerManager.updateLayers();

  const renderedLayers = layerManager.getLayers();
  const paths = renderedLayers.find(renderedLayer => renderedLayer instanceof PathLayer);
  expect(paths?.props.extensions[0]).toBeInstanceOf(PathStyleExtension);
  expect(renderedLayers.some(renderedLayer => renderedLayer instanceof SolidPolygonLayer)).toBe(
    true
  );

  await webgpuDevice.handle.queue.onSubmittedWorkDone();
  expect(await webgpuDevice.handle.popErrorScope()).toBeNull();

  layerManager.finalize();
});

test('ContourLayer generates WebGPU isolines without reading bins to the CPU', async ({skip}) => {
  const gpu = await getWebGPUTestDevice();
  if (!gpu) return skip();
  const viewport = new MapView().makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: -122, latitude: 38, zoom: 10}
  });
  const manager = new LayerManager(gpu, {viewport});
  const errors: Error[] = [];
  manager.setProps({onError: error => errors.push(error)});
  const layer = new ContourLayer({
    gpuGeometry: true,
    data: [{position: [-122, 38]}],
    cellSize: 200,
    contours: [{threshold: 1, strokeWidth: 2}]
  });
  /** Dispatch binning and isoline generation for the current layer. */
  const draw = (current: ContourLayer) =>
    current.draw({
      shaderModuleProps: {
        project: {
          viewport,
          coordinateSystem: 'lnglat',
          coordinateOrigin: [0, 0, 0],
          devicePixelRatio: 1
        }
      }
    } as any);
  /** Read the endpoints of the slots that have nonzero stroke width. */
  const readSegments = async () => {
    const line = manager.getLayers().find(item => item instanceof LineLayer) as LineLayer;
    expect(line).toBeDefined();
    await vi.waitFor(() => {
      expect(line.isLoaded).toBe(true);
      expect(line.getNumInstances()).toBe(line.props.sourcePositions!.length);
    });
    const {buffer} = getGPUVectorData(line.props.sourcePositions!);
    const output = new Float32Array((await buffer.readAsync()).buffer);
    const segments: string[] = [];
    for (let start = 0; start < output.length; start += 7) {
      if (output[start + 6]) segments.push(output.slice(start, start + 6).join(','));
    }
    return segments.sort();
  };

  gpu.handle.pushErrorScope('validation');
  try {
    manager.setLayers([layer]);
    draw(layer);
    const aggregator = layer.state.aggregator as WebGPUAggregator;
    expect(aggregator.isLoaded).toBe(true);
    expect(aggregator.getResultValues(0)).toBeNull();
    const [xRange, yRange] = layer.state.binIdRange;
    const expected = generateContours({
      contours: layer.props.contours,
      getValue: (x, y) => (x === xRange[0] && y === yRange[0] ? 1 : NaN),
      xRange,
      yRange
    });
    expect(expected.lines).toHaveLength(4);
    expect(await readSegments()).toEqual(
      expected.lines.map(line => line.vertices.flat().join(',')).sort()
    );

    const higherThreshold = layer.clone({contours: [{threshold: 2}]});
    manager.setLayers([higherThreshold]);
    draw(higherThreshold);
    expect(await readSegments()).toEqual([]);

    const cpuGeometry = higherThreshold.clone({gpuGeometry: false, contours: [{threshold: 1}]});
    manager.setLayers([cpuGeometry]);
    draw(cpuGeometry);
    await vi.waitFor(() => expect(aggregator.isLoaded).toBe(true));
    manager.updateLayers();
    expect(manager.getLayers().some(item => item instanceof PathLayer)).toBe(true);
    expect(cpuGeometry.state.aggregator).toBe(aggregator);

    const gpuGeometry = cpuGeometry.clone({gpuGeometry: true});
    manager.setLayers([gpuGeometry]);
    draw(gpuGeometry);
    expect(await readSegments()).toHaveLength(4);

    const originalLines = manager.getLayers().find(item => item instanceof LineLayer)!;
    const resized = gpuGeometry.clone({contours: [{threshold: 1}, {threshold: 2}]});
    manager.setLayers([resized]);
    draw(resized);
    const resizedLines = manager.getLayers().filter(item => item instanceof LineLayer);
    expect(resizedLines).toHaveLength(2);
    expect(resizedLines.map(line => line.id)).not.toContain(originalLines.id);
    expect(await readSegments()).toHaveLength(4);

    const cpu = resized.clone({gpuAggregation: false});
    manager.setLayers([cpu]);
    expect(manager.getLayers().some(item => item instanceof PathLayer)).toBe(true);
    expect(manager.getLayers().some(item => item instanceof LineLayer)).toBe(false);
    expect(errors).toEqual([]);
  } finally {
    manager.finalize();
    expect(await gpu.handle.popErrorScope()).toBeNull();
  }
});

test('ContourLayer', () => {
  const testCases = generateLayerTests({
    Layer: ContourLayer,
    sampleProps: {
      data: FIXTURES.points.slice(0, 3),
      getPosition
    },
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate({layer}) {
      expect(layer.state.aggregator, 'should create aggregator').toBeTruthy();
    }
  });

  testLayer({Layer: ContourLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

webglTest('ContourLayer#updates', async () => {
  let prevState: ContourLayer['state'];
  await testLayerAsync({
    Layer: ContourLayer,
    testCases: [
      {
        title: 'Render sublayers for both iso-lines and iso-bands',
        props: {
          data: FIXTURES.points,
          gpuAggregation: true,
          contours: CONTOURS,
          cellSize: 200,
          getPosition
        },
        onBeforeUpdate: ({testCase}) => console.log(testCase.title),
        onAfterUpdate: ({layer, subLayers}) => {
          expect(subLayers[0] instanceof PathLayer, 'Sublayer Line layer rendered').toBeTruthy();
          expect(
            subLayers[1] instanceof SolidPolygonLayer,
            'Sublayer SolidPolygon layer rendered'
          ).toBeTruthy();
          prevState = {...layer.state};
        }
      },
      {
        title: 'Update zOffset',
        updateProps: {
          zOffset: 0.1
        },
        onBeforeUpdate: ({testCase}) => console.log(testCase.title),
        onAfterUpdate: ({layer}) => {
          expect(prevState.aggregatedValueReader, 'aggregation not updated').toBe(
            (layer as ContourLayer).state.aggregatedValueReader
          );
          expect(prevState.contourData, 'contour data not updated').toBe(
            (layer as ContourLayer).state.contourData
          );
        }
      },
      {
        title: 'Update cellSize',
        updateProps: {
          cellSize: 300
        },
        onBeforeUpdate: ({testCase}) => console.log(testCase.title),
        onAfterUpdate: ({layer}) => {
          expect(prevState.aggregatedValueReader, 'aggregation is updated').not.toBe(
            (layer as ContourLayer).state.aggregatedValueReader
          );
          expect(prevState.contourData, 'contour data is recalculated').not.toBe(
            (layer as ContourLayer).state.contourData
          );
          prevState = {...layer.state};
        }
      },
      {
        title: 'Render sublayer for iso-lines',
        updateProps: {
          contours: CONTOURS.slice(0, 1)
        },
        onBeforeUpdate: ({testCase}) => console.log(testCase.title),
        onAfterUpdate: ({layer, subLayers}) => {
          expect(prevState.aggregatedValueReader, 'aggregation not updated').toBe(
            (layer as ContourLayer).state.aggregatedValueReader
          );
          expect(prevState.contourData, 'contour data is recalculated').not.toBe(
            (layer as ContourLayer).state.contourData
          );
          expect(subLayers[0] instanceof PathLayer, 'Sublayer Line layer rendered').toBeTruthy();
          expect(subLayers.length, 'Sublayer SolidPolygon layer not rendered').toBe(1);
          prevState = {...layer.state};
        }
      },
      {
        title: 'Render sublayer for iso-bands',
        updateProps: {
          contours: CONTOURS.slice(2, 3)
        },
        onBeforeUpdate: ({testCase}) => console.log(testCase.title),
        onAfterUpdate: ({layer, subLayers}) => {
          expect(prevState.aggregatedValueReader, 'aggregation not updated').toBe(
            (layer as ContourLayer).state.aggregatedValueReader
          );
          expect(prevState.contourData, 'contour data is recalculated').not.toBe(
            (layer as ContourLayer).state.contourData
          );
          expect(subLayers.length, 'Sublayer Line layer not rendered').toBe(1);
          expect(
            subLayers[0] instanceof SolidPolygonLayer,
            'Sublayer SolidPolygon layer rendered'
          ).toBeTruthy();
          prevState = {...layer.state};
        }
      },
      {
        title: 'Use CPU aggregation',
        updateProps: {
          gpuAggregation: false
        },
        onBeforeUpdate: ({testCase}) => console.log(testCase.title),
        onAfterUpdate: ({layer}) => {
          expect(prevState.aggregator, 'aggregator changed').not.toBe(
            (layer as ContourLayer).state.aggregator
          );
          expect(prevState.aggregatedValueReader, 'aggregation is updated').not.toBe(
            (layer as ContourLayer).state.aggregatedValueReader
          );
          expect(prevState.contourData, 'contour data is recalculated').not.toBe(
            (layer as ContourLayer).state.contourData
          );
          prevState = {...layer.state};
        }
      }
    ],
    onError: err => expect(err).toBeFalsy()
  });
});
