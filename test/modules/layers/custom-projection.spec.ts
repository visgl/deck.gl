// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {
  LayerManager,
  _CustomProjectionViewport as CustomProjectionViewport,
  WebMercatorViewport
} from '@deck.gl/core';
import {ScatterplotLayer, PathLayer, PolygonLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {device} from '@deck.gl/test-utils/vitest';
import {Matrix4} from '@math.gl/core';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';

const projection = {forward: p => p, inverse: p => p};
const options = {
  projection,
  outputBounds: [0, 0, 512, 512] as [number, number, number, number],
  width: 800,
  height: 600
};

test('position opt-in invalidates on projection and matrix changes, not navigation', () => {
  let calls = 0;
  const viewportOptionsProjection = {
    forward: p => {
      calls++;
      return [p[0] * 2, p[1], p[2]];
    },
    inverse: p => p
  };
  const viewport = new CustomProjectionViewport({
    ...options,
    projection: viewportOptionsProjection
  });
  const manager = new LayerManager(device, {viewport});
  manager.setProps({
    onError: error => {
      throw error;
    }
  });
  try {
    let layer = new ScatterplotLayer({
      id: 'points',
      data: [[10, 20]],
      getPosition: p => p,
      coordinateSystem: 'meter-offsets',
      coordinateOrigin: [100, 100, 0]
    });
    manager.setLayers([layer]);
    const positions = () => layer.getAttributeManager()!.attributes.instancePositions.value!;
    expect(Array.from(positions().slice(0, 3))).toEqual([20, 20, 0]);
    layer.activateViewport(viewport);
    const before = calls;
    layer.activateViewport(viewport);
    expect(calls).toBe(before);
    const cameraMoved = new CustomProjectionViewport({
      ...options,
      projection: viewportOptionsProjection,
      zoom: 2,
      target: [200, 200, 0]
    });
    const beforeCameraUpdate = calls;
    layer.activateViewport(cameraMoved);
    expect(calls).toBe(beforeCameraUpdate);
    const changedViewport = new CustomProjectionViewport({...options, projectionId: 'changed'});
    manager.activateViewport(changedViewport);
    layer.activateViewport(changedViewport);
    expect(Array.from(positions().slice(0, 3))).toEqual([10, 20, 0]);
    layer = layer.clone({modelMatrix: new Matrix4().translate([5, 0, 0])});
    manager.setLayers([layer]);
    expect(Array.from(positions().slice(0, 3))).toEqual([15, 20, 0]);
  } finally {
    manager.finalize();
  }

  const ordinary = new LayerManager(device, {viewport: new WebMercatorViewport()});
  try {
    const layer = new ScatterplotLayer({data: [[0, 0]], getPosition: p => p});
    ordinary.setLayers([layer]);
    expect(layer.getAttributeManager()!.attributes.instancePositions.settings.transform).toBeNull();
  } finally {
    ordinary.finalize();
  }
});

test('generated paths and polygon fills project without mutating input geometry', () => {
  const data = [
    [
      [10, 10],
      [20, 10],
      [20, 20],
      [10, 10]
    ]
  ];
  const original = JSON.stringify(data);
  const viewport = new CustomProjectionViewport({
    ...options,
    projection: {forward: p => [p[0] + 100, p[1] + 50, p[2]], inverse: p => p}
  });
  const manager = new LayerManager(device, {viewport});
  manager.setProps({
    onError: error => {
      throw error;
    }
  });
  try {
    const path = new PathLayer({id: 'path', data, getPath: p => p});
    const polygon = new SolidPolygonLayer({id: 'fill', data, getPolygon: p => p});
    const composite = new PolygonLayer({id: 'polygon', data, getPolygon: p => p});
    manager.setLayers([path, polygon, composite]);
    for (const layer of [path, polygon]) {
      const values = layer.getAttributeManager()!.attributes.vertexPositions.value!;
      expect(values[0]).toBeGreaterThanOrEqual(110);
      expect(values[1]).toBeGreaterThanOrEqual(60);
    }
    expect(JSON.stringify(data)).toBe(original);
  } finally {
    manager.finalize();
  }
});

test('WebGPU generated positions use preprojection before packing high/low neighbors', async ({
  skip
}) => {
  const webgpuDevice = await getWebGPUTestDevice();
  if (!webgpuDevice) return skip();
  const viewport = new CustomProjectionViewport({
    ...options,
    projection: {forward: p => [p[0] + 100, p[1] + 50, p[2]], inverse: p => p}
  });
  const manager = new LayerManager(webgpuDevice, {viewport});
  manager.setProps({
    onError: error => {
      throw error;
    }
  });
  try {
    const data = [
      [
        [10, 10],
        [20, 10],
        [20, 20],
        [10, 10]
      ]
    ];
    const path = new PathLayer({id: 'gpu-path', data, getPath: p => p});
    const polygon = new SolidPolygonLayer({id: 'gpu-polygon', data, getPolygon: p => p});
    manager.setLayers([path, polygon]);
    const pathPositions = path.getAttributeManager()!.attributes.pathPositions.value!;
    expect(pathPositions[3]).toBeGreaterThanOrEqual(110);
    expect(pathPositions[4]).toBeGreaterThanOrEqual(60);
    const attributes = polygon.getAttributeManager()!.attributes;
    expect(attributes.vertexPositions.value![0]).toBeGreaterThanOrEqual(110);
    expect(attributes.nextVertexPositions.value![0]).toBeGreaterThanOrEqual(110);
    expect(attributes.nextVertexPositions.value![0]).toBeLessThanOrEqual(120);
  } finally {
    manager.finalize();
  }
});

test('geometry layers retessellate all rows on projection and model matrix changes', () => {
  const data = [
    [
      [10, 10],
      [20, 10],
      [20, 20],
      [10, 10]
    ],
    [
      [30, 30],
      [40, 30],
      [40, 40],
      [30, 30]
    ]
  ];
  const manager = new LayerManager(device, {viewport: new CustomProjectionViewport(options)});
  manager.setProps({
    onError: error => {
      throw error;
    }
  });
  try {
    let layers = [
      new PathLayer({id: 'reproject-path', data, getPath: p => p}),
      new SolidPolygonLayer({id: 'reproject-polygon', data, getPolygon: p => p})
    ];
    manager.setLayers(layers);
    const sources = layers.map(layer =>
      Array.from(layer.getAttributeManager()!.attributes.vertexPositions.value!)
    );
    layers = layers.map(layer =>
      layer.clone({modelMatrix: new Matrix4().translate([100, 0, 0])})
    ) as typeof layers;
    manager.setLayers(layers);
    for (let j = 0; j < layers.length; j++) {
      const layer = layers[j];
      const values = layer.getAttributeManager()!.attributes.vertexPositions.value!;
      for (let row = 0; row < data.length; row++) {
        const offset = layer.state.startIndices[row] * 3;
        expect(values[offset]).toBeCloseTo(sources[j][offset] + 100);
      }
    }
    const viewport = new CustomProjectionViewport({
      ...options,
      projection: {
        forward: p => [p[0] + 50, p[1], p[2]],
        inverse: p => [p[0] - 50, p[1], p[2]]
      }
    });
    manager.activateViewport(viewport);
    for (let j = 0; j < layers.length; j++) {
      const layer = layers[j];
      layer.activateViewport(viewport);
      const values = layer.getAttributeManager()!.attributes.vertexPositions.value!;
      for (let row = 0; row < data.length; row++) {
        const offset = layer.state.startIndices[row] * 3;
        expect(values[offset]).toBeCloseTo(sources[j][offset] + 150);
      }
    }
  } finally {
    manager.finalize();
  }
});
