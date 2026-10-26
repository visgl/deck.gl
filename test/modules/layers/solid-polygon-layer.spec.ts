// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {geojsonToBinary} from '@loaders.gl/gis';
import {LayerManager, MapView, _GlobeViewport as GlobeViewport} from '@deck.gl/core';
import {GeoJsonLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {device} from '@deck.gl/test-utils/vitest';
import {Matrix4} from '@math.gl/core';
import {geoJSONData} from './data/fixtures';
import PolygonTesselator from '@deck.gl/layers/solid-polygon-layer/polygon-tesselator';

test('PolygonTesselator preserves supplied geocentric triangle winding', () => {
  const positions = new Float32Array([1, 0, 0, 0, 0, 1, 0, 1, 0]);
  const indices = new Uint16Array([0, 1, 2]);
  const data = {length: 1, startIndices: [0, 3]};
  const tesselator = new PolygonTesselator({
    data,
    geometryBuffer: positions,
    buffers: {indices},
    normalize: false,
    positionFormat: 'XYZ',
    full3d: true,
    geocentric: true,
    preproject: () => {
      throw new Error('Prepared triangles must bypass triangulation');
    }
  });
  expect(tesselator.get('indices')).toBeFalsy();
  expect(Array.from(positions)).toEqual([1, 0, 0, 0, 0, 1, 0, 1, 0]);
  expect(Array.from(indices)).toEqual([0, 1, 2]);
});

test('SolidPolygonLayer#binary positions without preprojection remain in world coordinates', () => {
  const viewport = new MapView().makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: 0, latitude: 0, zoom: 1}
  });
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
    expect(layer.state.preproject).toBeFalsy();
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

test.each(['XY', 'XYZ'] as const)(
  'SolidPolygonLayer#tessellates a polar %s polygon without preprojecting attributes',
  positionFormat => {
    const viewport = new GlobeViewport({latitude: -90});
    const manager = new LayerManager(device, {viewport});
    manager.setProps({
      onError: error => {
        throw error;
      }
    });
    const ring = [
      [-135, -80],
      [-45, -80],
      [45, -80],
      [135, -80],
      [-135, -80]
    ];
    const layer = new SolidPolygonLayer({
      data: [ring],
      getPolygon: polygon => polygon,
      positionFormat
    });
    try {
      manager.setLayers([layer]);
      expect(layer.state.preproject).toBeNull();
      const tessellator = layer.state.polygonTesselator;
      const indices = tessellator.get('indices');
      expect(indices).toHaveLength(6);
      const packed = tessellator.get('positions');
      for (let i = 0; i < tessellator.instanceCount; i++) {
        expect(
          ring.some(point => point[0] === packed[i * 3] && point[1] === packed[i * 3 + 1])
        ).toBe(true);
      }
      for (let i = 0; i < indices.length; i += 3) {
        const [a, b, c] = Array.from(indices.slice(i, i + 3), index =>
          viewport.projectPosition(Array.from(packed.slice(index * 3, index * 3 + 3)))
        );
        const orientation =
          a[0] * (b[1] * c[2] - b[2] * c[1]) +
          a[1] * (b[2] * c[0] - b[0] * c[2]) +
          a[2] * (b[0] * c[1] - b[1] * c[0]);
        expect(orientation).toBeGreaterThan(0);
      }
    } finally {
      manager.finalize();
    }
  }
);

test('SolidPolygonLayer retriangulates geospatial geometry when transforms change', () => {
  const viewport = new GlobeViewport();
  const manager = new LayerManager(device, {viewport});
  manager.setProps({
    onError: error => {
      throw error;
    }
  });
  const ring = [
    [-135, 80],
    [-45, 80],
    [45, 80],
    [135, 80],
    [-135, 80]
  ];
  let layer = new SolidPolygonLayer({
    id: 'transformed-polar-polygon',
    data: [ring],
    getPolygon: polygon => polygon,
    modelMatrix: new Matrix4(),
    coordinateOrigin: [0, 0, 0]
  });
  const expectOutwardTriangles = () => {
    const tessellator = layer.state.polygonTesselator;
    const indices = tessellator.get('indices');
    const packed = tessellator.get('positions');
    expect(indices).toHaveLength(6);
    for (let i = 0; i < indices.length; i += 3) {
      const [a, b, c] = Array.from(indices.slice(i, i + 3), index =>
        layer.projectPosition(Array.from(packed.slice(index * 3, index * 3 + 3)), {
          autoOffset: false
        })
      );
      const orientation =
        a[0] * (b[1] * c[2] - b[2] * c[1]) +
        a[1] * (b[2] * c[0] - b[0] * c[2]) +
        a[2] * (b[0] * c[1] - b[1] * c[0]);
      expect(orientation).toBeGreaterThan(0);
    }
  };
  try {
    manager.setLayers([layer]);
    expect(layer.state.preproject).toBeNull();
    expectOutwardTriangles();
    const updateGeometry = vi.spyOn(layer.state.polygonTesselator, 'updateGeometry');
    // Equal array values should not rebuild geometry when the layer is cloned.
    layer = layer.clone({modelMatrix: new Matrix4(), coordinateOrigin: [0, 0, 0]});
    manager.setLayers([layer]);
    expect(updateGeometry).not.toHaveBeenCalled();

    layer = layer.clone({modelMatrix: new Matrix4().translate([0, -160, 0])});
    manager.setLayers([layer]);
    expect(updateGeometry).toHaveBeenCalledTimes(1);
    expectOutwardTriangles();

    layer = layer.clone({coordinateOrigin: [0, 160, 0]});
    manager.setLayers([layer]);
    expect(updateGeometry).toHaveBeenCalledTimes(2);
    expectOutwardTriangles();
  } finally {
    manager.finalize();
  }
});
