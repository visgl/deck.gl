// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {
  LayerManager,
  _CustomProjectionViewport as CustomProjectionViewport,
  WebMercatorViewport
} from '@deck.gl/core';
import {
  ArcLayer,
  LineLayer,
  ScatterplotLayer,
  PathLayer,
  PolygonLayer,
  SolidPolygonLayer
} from '@deck.gl/layers';
import {device} from '@deck.gl/test-utils/vitest';
import {Matrix4} from '@math.gl/core';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';

const projection = {forward: p => p, inverse: p => p};
const normalizationScale = 512 / 40075016.6855;
const options = {
  projection,

  width: 800,
  height: 600
};

for (const LayerType of [LineLayer, ArcLayer]) {
  for (const projected of [false, true]) {
    for (const wrapLongitude of [false, true]) {
      test(`${LayerType.layerName} wrapping: projected=${projected}, wrapLongitude=${wrapLongitude}`, () => {
        const viewport = projected
          ? new CustomProjectionViewport(options)
          : new WebMercatorViewport({width: 800, height: 600});
        const manager = new LayerManager(device, {viewport});
        manager.setProps({
          onError: error => {
            throw error;
          }
        });
        const layer = new LayerType({
          data: [{}],
          getSourcePosition: () => [170, 0],
          getTargetPosition: () => [-170, 1],
          wrapLongitude
        });
        try {
          manager.setLayers([layer]);
          const model = layer.state.model!;
          const draw = vi.spyOn(model, 'draw').mockReturnValue(true);
          const setProps = vi.spyOn(model.shaderInputs, 'setProps');
          const wraps = wrapLongitude && !projected;
          layer.draw({uniforms: {}});
          if (LayerType === LineLayer) {
            expect(draw).toHaveBeenCalledTimes(wraps ? 2 : 1);
            expect(setProps).toHaveBeenNthCalledWith(1, {
              line: expect.objectContaining({useShortestPath: wraps ? 1 : 0})
            });
            if (wraps) {
              expect(setProps).toHaveBeenNthCalledWith(2, {
                line: expect.objectContaining({useShortestPath: -1})
              });
            }
          } else {
            expect(draw).toHaveBeenCalledTimes(1);
            expect(setProps).toHaveBeenCalledWith({
              arc: expect.objectContaining({useShortestPath: wraps})
            });
          }
          expect(layer.props.wrapLongitude).toBe(wrapLongitude);
        } finally {
          vi.restoreAllMocks();
          manager.finalize();
        }
      });
    }
  }
}

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
    expect(Array.from(positions().slice(0, 3))).toEqual([
      256 + 20 * normalizationScale,
      256 + 20 * normalizationScale,
      0
    ]);
    layer.activateViewport(viewport);
    const before = calls;
    layer.activateViewport(viewport);
    expect(calls).toBe(before);
    const cameraMoved = new CustomProjectionViewport({
      ...options,
      projection: viewportOptionsProjection,
      zoom: 2,
      center: [200, 200, 0]
    });
    const beforeCameraUpdate = calls;
    layer.activateViewport(cameraMoved);
    expect(calls).toBe(beforeCameraUpdate);
    const changedViewport = new CustomProjectionViewport({...options, toCrs: 'changed'});
    manager.activateViewport(changedViewport);
    layer.activateViewport(changedViewport);
    expect(Array.from(positions().slice(0, 3))).toEqual([
      256 + 10 * normalizationScale,
      256 + 20 * normalizationScale,
      0
    ]);
    layer = layer.clone({modelMatrix: new Matrix4().translate([5, 0, 0])});
    manager.setLayers([layer]);
    expect(Array.from(positions().slice(0, 3))).toEqual([
      256 + 15 * normalizationScale,
      256 + 20 * normalizationScale,
      0
    ]);
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
      expect(values[0]).toBeGreaterThanOrEqual(256 + 110 * normalizationScale - 1e-5);
      expect(values[1]).toBeGreaterThanOrEqual(256 + 60 * normalizationScale - 1e-5);
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
    expect(pathPositions[3]).toBeGreaterThanOrEqual(256 + 110 * normalizationScale - 1e-5);
    expect(pathPositions[4]).toBeGreaterThanOrEqual(256 + 60 * normalizationScale - 1e-5);
    const attributes = polygon.getAttributeManager()!.attributes;
    expect(attributes.vertexPositions.value![0]).toBeGreaterThanOrEqual(
      256 + 110 * normalizationScale - 1e-5
    );
    expect(attributes.nextVertexPositions.value![0]).toBeGreaterThanOrEqual(
      256 + 110 * normalizationScale - 1e-5
    );
    expect(attributes.nextVertexPositions.value![0]).toBeLessThanOrEqual(
      256 + 120 * normalizationScale + 1e-5
    );
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
        expect(values[offset]).toBeCloseTo(sources[j][offset] + 100 * normalizationScale, 6);
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
        expect(values[offset]).toBeCloseTo(sources[j][offset] + 150 * normalizationScale, 6);
      }
    }
  } finally {
    manager.finalize();
  }
});
