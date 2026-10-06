// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {geojsonToBinary} from '@loaders.gl/gis';
import {LayerManager, MapView} from '@deck.gl/core';
import {GeoJsonLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {device} from '@deck.gl/test-utils/vitest';
import {Matrix4} from '@math.gl/core';
import {geoJSONData} from './data/fixtures';

test('SolidPolygonLayer#binary positions without preprojection remain in world coordinates', () => {
  const viewport = new MapView().makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: 0, latitude: 0, zoom: 1}
  });
  expect(viewport.preproject).toBeFalsy();
  const manager = new LayerManager(device, {viewport});
  manager.setProps({
    onError: error => {
      throw error;
    }
  });
  const positions = {value: new Float32Array([0, 0, 1, 0, 1, 1, 0, 0]), size: 2};
  const layer = new SolidPolygonLayer({
    id: 'binary-unprojected',
    data: {
      length: 1,
      startIndices: [0, 4],
      attributes: {getPolygon: positions, indices: new Uint32Array([0, 1, 2])}
    },
    _normalize: false,
    positionFormat: 'XY',
    modelMatrix: new Matrix4().translate([10, 20, 0]).scale([2, 3, 1])
  });
  try {
    manager.setLayers([layer]);
    const attribute = layer.getAttributeManager()!.getAttributes().vertexPositions;
    expect(attribute.value).toBe(positions.value);
    expect(attribute.settings.transform).toBeFalsy();
    expect(layer.state.polygonTesselator.instanceCount).toBe(4);
  } finally {
    manager.finalize();
  }
});

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
  expect(attributes?.vertexPositions.value, 'preserves binary float32 positions').toBeInstanceOf(
    Float32Array
  );
  const positionBuffers = attributes!.vertexPositions.getValue();
  expect(positionBuffers.nextVertexPositions, 'shares the current-position buffer').toBe(
    positionBuffers.vertexPositions
  );
  const positionLayout = solidPolygonLayer!
    .getAttributeManager()!
    .getBufferLayouts({isInstanced: true})
    .find(layout => layout.name === 'vertexPositions')!;
  const currentPosition = positionLayout.attributes!.find(
    attribute => attribute.attribute === 'vertexPositions'
  )!;
  const nextPosition = positionLayout.attributes!.find(
    attribute => attribute.attribute === 'nextVertexPositions'
  )!;
  expect(nextPosition.byteOffset, 'reads the next vertex using the source stride').toBe(
    currentPosition.byteOffset + positionLayout.byteStride!
  );

  await webgpuDevice.handle.queue.onSubmittedWorkDone();
  expect(
    await webgpuDevice.handle.popErrorScope(),
    'binary polygon tops, sides, and wireframes have valid WebGPU pipelines'
  ).toBeNull();

  layerManager.finalize();
});
