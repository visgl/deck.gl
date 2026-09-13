// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {LayerManager, MapView} from '@deck.gl/core';
import {GeoJsonLayer, PathLayer, ScatterplotLayer} from '@deck.gl/layers';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {geojsonToBinary} from '@loaders.gl/gis';

test('GeoJsonLayer#WebGPU binary points and paths', async ({skip}) => {
  const webgpuDevice = await getWebGPUTestDevice();
  if (!webgpuDevice) {
    skip();
    return;
  }

  const viewport = new MapView().makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: 0, latitude: 0, zoom: 1}
  });
  const data = geojsonToBinary([
    {type: 'Feature', properties: {}, geometry: {type: 'Point', coordinates: [0, 0]}},
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [-1, 0],
          [1, 0]
        ]
      }
    }
  ] as any);
  const errors: Error[] = [];
  const layerManager = new LayerManager(webgpuDevice, {viewport});
  layerManager.setProps({onError: error => errors.push(error)});

  webgpuDevice.handle.pushErrorScope('validation');
  layerManager.setLayers([
    new GeoJsonLayer({
      id: 'webgpu-binary-geojson',
      data
    })
  ]);

  const scatterplotLayer = layerManager.layers.find(layer => layer instanceof ScatterplotLayer) as
    | ScatterplotLayer
    | undefined;
  const pathLayer = layerManager.layers.find(layer => layer instanceof PathLayer) as
    | PathLayer
    | undefined;
  const pathPositions = pathLayer?.getAttributeManager()?.getAttributes().pathPositions.value;

  expect(errors, 'binary sublayers initialize').toEqual([]);
  expect(scatterplotLayer?.state.model, 'creates the point pipeline').toBeDefined();
  expect(pathLayer?.state.model, 'creates the path pipeline').toBeDefined();
  expect(
    pathPositions && Array.from(pathPositions).some(Boolean),
    'expands binary XY positions into the WebGPU neighbor window'
  ).toBe(true);

  await webgpuDevice.handle.queue.onSubmittedWorkDone();
  expect(await webgpuDevice.handle.popErrorScope(), 'pipelines pass WebGPU validation').toBeNull();

  layerManager.finalize();
});
