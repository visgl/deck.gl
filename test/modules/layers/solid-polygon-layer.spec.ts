// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {geojsonToBinary} from '@loaders.gl/gis';
import {LayerManager, MapView} from '@deck.gl/core';
import {GeoJsonLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {geoJSONData} from './data/fixtures';

test('SolidPolygonLayer#WebGPU binary extruded polygons', async ({skip}) => {
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
  const errors: Error[] = [];
  const layerManager = new LayerManager(webgpuDevice, {viewport});
  layerManager.setProps({onError: error => errors.push(error)});

  const layer = new GeoJsonLayer({
    id: 'webgpu-binary-extruded-polygons',
    data: geojsonToBinary(geoJSONData),
    extruded: true,
    wireframe: true,
    stroked: false,
    getElevation: 100
  });

  webgpuDevice.handle.pushErrorScope('validation');
  layerManager.setLayers([layer]);

  const solidPolygonLayer = layerManager.layers.find(
    currentLayer => currentLayer instanceof SolidPolygonLayer
  ) as SolidPolygonLayer | undefined;

  expect(errors, 'binary GeoJSON polygon sublayers initialize').toEqual([]);
  expect(solidPolygonLayer, 'creates the solid polygon sublayer').toBeDefined();
  expect(solidPolygonLayer?.state.topModel, 'creates the polygon top pipeline').toBeDefined();
  expect(solidPolygonLayer?.state.sideModel, 'creates the polygon side pipeline').toBeDefined();
  expect(
    solidPolygonLayer?.state.wireframeModel,
    'creates the polygon wireframe pipeline'
  ).toBeDefined();

  const attributes = solidPolygonLayer?.getAttributeManager()?.getAttributes();
  expect(attributes?.vertexValid.value, 'packs binary vertex validity as float32').toBeInstanceOf(
    Float32Array
  );
  expect(attributes?.vertexValid.value, 'preserves binary polygon ring boundaries').toEqual(
    Float32Array.from((solidPolygonLayer?.props.data as any).attributes.instanceVertexValid.value)
  );
  expect(attributes?.vertexPositions.value, 'widens binary XY positions').toBeInstanceOf(
    Float64Array
  );
  expect(
    attributes?.nextVertexPositions.value,
    'materializes adjacent polygon vertices instead of rebinding their current positions'
  ).not.toBe(attributes?.vertexPositions.value);
  expect(
    Array.from(attributes?.nextVertexPositions.value?.slice(0, 3) || []),
    'the first side connects to the next polygon vertex'
  ).toEqual(Array.from(attributes?.vertexPositions.value?.slice(3, 6) || []));

  const vertexValidity = attributes?.vertexValid.value;
  for (let vertexIndex = 0; vertexIndex < (vertexValidity?.length || 0); vertexIndex++) {
    if (vertexValidity?.[vertexIndex] === 0) {
      const offset = vertexIndex * 3;
      expect(
        Array.from(attributes?.nextVertexPositions.value?.slice(offset, offset + 3) || []),
        'does not create side segments between polygon rings'
      ).toEqual(Array.from(attributes?.vertexPositions.value?.slice(offset, offset + 3) || []));
    }
  }

  await webgpuDevice.handle.queue.onSubmittedWorkDone();
  expect(
    await webgpuDevice.handle.popErrorScope(),
    'binary polygon tops, sides, and wireframes have valid WebGPU pipelines'
  ).toBeNull();

  layerManager.finalize();
});
