// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {LayerManager, MapView} from '@deck.gl/core';
import {ArcLayer, GeoJsonLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';

test('ArcLayer#WebGPU renders arcs alongside filled GeoJSON polygons', async ({skip}) => {
  const webgpuDevice = await getWebGPUTestDevice();

  if (!webgpuDevice) {
    skip();
    return;
  }

  const viewport = new MapView().makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: -100, latitude: 40, zoom: 3}
  });
  const errors: Error[] = [];
  const layerManager = new LayerManager(webgpuDevice, {viewport});
  layerManager.setProps({onError: error => errors.push(error)});

  const counties = new GeoJsonLayer({
    id: 'webgpu-arc-counties',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-101, 39],
                [-99, 39],
                [-99, 41],
                [-101, 41],
                [-101, 39]
              ]
            ]
          }
        }
      ]
    },
    filled: true,
    stroked: false,
    getFillColor: [0, 0, 0, 0]
  });
  const arcs = new ArcLayer({
    id: 'webgpu-arc-flows',
    data: [{source: [-101, 40], target: [-99, 40]}],
    getSourcePosition: flow => flow.source,
    getTargetPosition: flow => flow.target,
    getSourceColor: [0, 128, 255],
    getTargetColor: [255, 64, 0],
    getWidth: 2
  });

  webgpuDevice.handle.pushErrorScope('validation');
  layerManager.setLayers([counties, arcs]);

  expect(errors).toEqual([]);
  expect(arcs.state.model).toBeDefined();
  expect(
    layerManager.getLayers().some(renderedLayer => renderedLayer instanceof SolidPolygonLayer)
  ).toBe(true);

  await webgpuDevice.handle.queue.onSubmittedWorkDone();
  expect(await webgpuDevice.handle.popErrorScope()).toBeNull();

  layerManager.finalize();
});
