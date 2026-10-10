// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {
  LayerManager,
  OrthographicViewport,
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
    expect(Array.from(positions().slice(0, 3))).toEqual([20, 20, 0]);
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
      expect(values[0]).toBeGreaterThanOrEqual(110 - 1e-5);
      expect(values[1]).toBeGreaterThanOrEqual(60 - 1e-5);
    }
    expect(JSON.stringify(data)).toBe(original);
  } finally {
    manager.finalize();
  }
});

test('WebGPU generated positions use preprojection for current and next vertices', async ({
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
    expect(pathPositions[3]).toBeGreaterThanOrEqual(110 - 1e-5);
    expect(pathPositions[4]).toBeGreaterThanOrEqual(60 - 1e-5);
    const attributes = polygon.getAttributeManager()!.attributes;
    expect(attributes.vertexPositions.value![0]).toBeGreaterThanOrEqual(110 - 1e-5);
    expect(attributes.vertexPositions.value![3]).toBeGreaterThanOrEqual(110 - 1e-5);
    expect(attributes.vertexPositions.value![3]).toBeLessThanOrEqual(120 + 1e-5);
    const positionBuffers = attributes.vertexPositions.getValue();
    expect(positionBuffers.nextVertexPositions).toBe(positionBuffers.vertexPositions);
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
        expect(values[offset]).toBeCloseTo(sources[j][offset] + 100, 6);
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
        expect(values[offset]).toBeCloseTo(sources[j][offset] + 150, 6);
      }
    }
  } finally {
    manager.finalize();
  }
});

for (const LayerType of [PathLayer, SolidPolygonLayer]) {
  test(`${LayerType.layerName} disables longitude wrapping with preprojection`, () => {
    for (const fromCrs of [
      'WGS84',
      'EPSG:4326',
      '+proj=longlat +datum=WGS84',
      '+proj=utm +zone=10 +units=m',
      'EPSG:32610',
      'unknown'
    ]) {
      const spherical = ['WGS84', 'EPSG:4326', '+proj=longlat +datum=WGS84'].includes(fromCrs);
      const viewport = new CustomProjectionViewport({
        ...options,
        fromCrs,
        projection: {
          forward: ([x, y, z = 0]) => [x * 2, y * 2, z],
          inverse: ([x, y, z = 0]) => [x / 2, y / 2, z]
        }
      });
      const manager = new LayerManager(device, {viewport});
      manager.setProps({
        onError: error => {
          throw error;
        }
      });
      const data = spherical
        ? [
            [
              [170, 0],
              [-170, 0],
              [-170, 10],
              [170, 10],
              [170, 0]
            ]
          ]
        : [
            [
              [500000, 4000000],
              [500100, 4000000],
              [500100, 4000100],
              [500000, 4000100],
              [500000, 4000000]
            ]
          ];
      try {
        for (const coordinateSystem of ['default', 'cartesian'] as const) {
          const layers = [false, true].map(
            wrapLongitude =>
              new LayerType({
                id: `${LayerType.layerName}-${wrapLongitude}-${coordinateSystem}`,
                data,
                getPath: p => p,
                getPolygon: p => p,
                coordinateSystem,
                wrapLongitude
              })
          );
          manager.setLayers(layers);
          const positions = layers.map(layer =>
            Array.from(
              layer
                .getAttributeManager()!
                .attributes.vertexPositions.value!.slice(0, layer.state.numInstances * 3)
            )
          );
          expect(positions[1]).toEqual(positions[0]);
        }
      } finally {
        manager.finalize();
      }
    }
  });

  test(`${LayerType.layerName} rebuilds all rows when coordinateSystem changes`, () => {
    const manager = new LayerManager(device, {
      viewport: new CustomProjectionViewport({
        ...options,
        projection: {
          forward: ([x, y, z = 0]) => [x + 100, y + 50, z],
          inverse: ([x, y, z = 0]) => [x - 100, y - 50, z]
        }
      })
    });
    manager.setProps({
      onError: error => {
        throw error;
      }
    });
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
    let layer = new LayerType({
      id: 'switch-coordinate-system',
      data,
      getPath: p => p,
      getPolygon: p => p
    });
    try {
      manager.setLayers([layer]);
      const original = Array.from(layer.getAttributeManager()!.attributes.vertexPositions.value!);
      for (const coordinateSystem of ['cartesian', 'default'] as const) {
        // A coordinate-system switch must rebuild even rows outside a simultaneous data diff.
        layer = layer.clone({
          coordinateSystem,
          data: data.slice(),
          _dataDiff: () => [{startRow: 0, endRow: 1}]
        });
        manager.setLayers([layer]);
        const positions = layer.getAttributeManager()!.attributes.vertexPositions.value!;
        for (let row = 0; row < data.length; row++) {
          const offset = layer.state.startIndices[row] * 3;
          expect(positions[offset]).toBeCloseTo(
            original[offset] - (coordinateSystem === 'cartesian' ? 100 : 0),
            6
          );
          expect(positions[offset + 1]).toBeCloseTo(
            original[offset + 1] - (coordinateSystem === 'cartesian' ? 50 : 0),
            6
          );
        }
      }
    } finally {
      manager.finalize();
    }
  });
}

test('WebGPU binary polygons project every subdivided vertex', async ({skip}) => {
  const webgpuDevice = await getWebGPUTestDevice();
  if (!webgpuDevice) return skip();
  const viewport = new CustomProjectionViewport({
    ...options,
    resolution: 5,
    projection: {
      forward: ([x, y, z = 0]) => [x + 100, y + 50, z],
      inverse: ([x, y, z = 0]) => [x - 100, y - 50, z]
    }
  });
  const manager = new LayerManager(webgpuDevice, {viewport});
  manager.setProps({
    onError: error => {
      throw error;
    }
  });
  const source = new Float64Array([10, 10, 20, 10, 20, 20, 10, 10]);
  const layer = new SolidPolygonLayer({
    id: 'subdivided-binary-polygon',
    data: {length: 1, startIndices: [0, 4], attributes: {getPolygon: {value: source, size: 2}}},
    positionFormat: 'XY',
    _normalize: true
  });
  try {
    manager.setLayers([layer]);
    expect(layer.state.numInstances).toBeGreaterThan(source.length / 2);
    const positions = layer.getAttributeManager()!.attributes.vertexPositions.value!;
    for (let i = 0; i < layer.state.numInstances * 3; i += 3) {
      expect(positions[i]).toBeGreaterThanOrEqual(110 - 1e-5);
      expect(positions[i]).toBeLessThanOrEqual(120 + 1e-5);
      expect(positions[i + 1]).toBeGreaterThanOrEqual(60 - 1e-5);
      expect(positions[i + 1]).toBeLessThanOrEqual(70 + 1e-5);
    }
    expect(Array.from(source)).toEqual([10, 10, 20, 10, 20, 20, 10, 10]);
  } finally {
    manager.finalize();
  }
});

for (const LayerType of [PathLayer, SolidPolygonLayer]) {
  test(`${LayerType.layerName} adaptive tolerance rebuilds every row alongside a partial data diff`, () => {
    const viewport = new CustomProjectionViewport({
      projection: {
        forward: ([x, y, z = 0]) => [x, y + x * x, z],
        inverse: ([x, y, z = 0]) => [x, y - x * x, z]
      }
    });
    const manager = new LayerManager(device, {viewport});
    manager.setProps({
      onError: error => {
        throw error;
      }
    });
    const data = [
      [
        [0, 0],
        [8, 0],
        [8, 2],
        [0, 0]
      ],
      [
        [10, 0],
        [18, 0],
        [18, 2],
        [10, 0]
      ]
    ];
    let layer = new LayerType({
      id: 'adaptive-partial',
      data,
      getPath: p => p,
      getPolygon: p => p,
      _projectionTolerance: 1
    });
    try {
      manager.setLayers([layer]);
      const oldCount = layer.state.startIndices[2] - layer.state.startIndices[1];
      layer = layer.clone({
        data: data.slice(),
        _dataDiff: () => [{startRow: 0, endRow: 1}],
        _projectionTolerance: 0.01
      });
      manager.setLayers([layer]);
      const newCount = layer.state.startIndices[2] - layer.state.startIndices[1];
      expect(newCount).toBeGreaterThan(oldCount);
      layer = layer.clone({_projectionTolerance: 0});
      manager.setLayers([layer]);
      expect(layer.state.startIndices[2] - layer.state.startIndices[1]).toBeLessThan(oldCount);
    } finally {
      manager.finalize();
    }
  });

  test(`${LayerType.layerName} adaptive refinement rejects GPU-only coordinates`, () => {
    const viewport = new CustomProjectionViewport(options);
    const manager = new LayerManager(device, {viewport});
    manager.setProps({
      onError: error => {
        throw error;
      }
    });
    const buffer = device.createBuffer({data: new Float32Array([0, 0, 0, 1, 1, 0, 0, 0, 0])});
    const geometry = LayerType === PathLayer ? 'getPath' : 'getPolygon';
    try {
      expect(() =>
        manager.setLayers([
          new LayerType({
            id: 'adaptive-gpu',
            _projectionTolerance: 1,
            data: {length: 1, startIndices: [0, 3], attributes: {[geometry]: buffer}}
          })
        ])
      ).toThrow('Projection refinement');
    } finally {
      manager.finalize();
      buffer.destroy();
    }
  });
}

test('adaptive RGB paths accept the default RGBA color', () => {
  const manager = new LayerManager(device, {viewport: new CustomProjectionViewport(options)});
  manager.setProps({
    onError: error => {
      throw error;
    }
  });
  try {
    const layer = new PathLayer({
      id: 'adaptive-rgb',
      data: [
        [
          [0, 0],
          [1, 1]
        ]
      ],
      getPath: p => p,
      colorFormat: 'RGB',
      _projectionTolerance: 1
    });
    manager.setLayers([layer]);
    expect(layer.state.numInstances).toBeGreaterThan(0);
    expect(
      Array.from(
        layer
          .getAttributeManager()!
          .attributes.instanceColors.value!.slice(0, layer.state.numInstances * 3)
      )
    ).toEqual([0, 0, 0]);
  } finally {
    manager.finalize();
  }
});

for (const accessor of ['getFillColor', 'getLineColor', 'getElevation']) {
  test(`adaptive polygons reject per-vertex ${accessor}`, () => {
    const manager = new LayerManager(device, {viewport: new CustomProjectionViewport(options)});
    manager.setProps({
      onError: error => {
        throw error;
      }
    });
    try {
      const layer = new SolidPolygonLayer({
        id: 'adaptive-style',
        data: [
          [
            [0, 0],
            [1, 0],
            [1, 1]
          ]
        ],
        getPolygon: p => p,
        wireframe: true,
        extruded: true,
        _projectionTolerance: 1,
        [accessor]: () =>
          accessor === 'getElevation'
            ? [1, 2, 3]
            : [
                [1, 2, 3, 255],
                [4, 5, 6, 255],
                [7, 8, 9, 255]
              ]
      });
      expect(() => manager.setLayers([layer])).toThrow('per-object');
    } finally {
      manager.finalize();
    }
  });
}

for (const LayerType of [PathLayer, SolidPolygonLayer]) {
  test(`${LayerType.layerName} adaptive RGB attributes repeat a single accessor RGBA color`, () => {
    const viewport = new CustomProjectionViewport({
      projection: {
        forward: ([x, y, z = 0]) => [x, y + x * x, z],
        inverse: ([x, y, z = 0]) => [x, y - x * x, z]
      }
    });
    const manager = new LayerManager(device, {viewport});
    manager.setProps({
      onError: error => {
        throw error;
      }
    });
    try {
      const layer = new LayerType({
        id: 'adaptive-rgb-accessor',
        data: [
          [
            [0, 0],
            [4, 0],
            [4, 2],
            [0, 0]
          ]
        ],
        getPath: p => p,
        getPolygon: p => p,
        getColor: () => [12, 34, 56, 255],
        getFillColor: () => [12, 34, 56, 255],
        getLineColor: () => [12, 34, 56, 255],
        colorFormat: 'RGB',
        _projectionTolerance: 0.01,
        extruded: true,
        wireframe: true
      });
      manager.setLayers([layer]);
      const attributes = layer.getAttributeManager()!.attributes;
      const names = LayerType === PathLayer ? ['instanceColors'] : ['fillColors', 'lineColors'];
      for (const name of names) {
        const colors = attributes[name].value!;
        for (let i = 0; i < layer.state.numInstances; i++) {
          expect(Array.from(colors.slice(i * 3, i * 3 + 3))).toEqual([12, 34, 56]);
        }
      }
    } finally {
      manager.finalize();
    }
  });
}

for (const LayerType of [PathLayer, SolidPolygonLayer]) {
  test(`${LayerType.layerName} disabled refinement preserves binary float colors`, () => {
    const manager = new LayerManager(device, {
      viewport: new OrthographicViewport({width: 800, height: 600})
    });
    manager.setProps({
      onError: error => {
        throw error;
      }
    });
    const coordinates = new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0]);
    const colors = new Float32Array([0.7, 0.2, 0, 0.3, 0.5, 0, 0, 0.8, 0.6]);
    const attributeName = LayerType === PathLayer ? 'instanceColors' : 'fillColors';
    const geometryName = LayerType === PathLayer ? 'getPath' : 'getPolygon';
    const colorName = LayerType === PathLayer ? 'getColor' : 'getFillColor';
    try {
      const layer = new LayerType({
        id: 'unrefined-binary-colors',
        _normalize: false,
        _pathType: 'open',
        data: {
          length: 1,
          startIndices: [0, 3],
          attributes: {
            [geometryName]: coordinates,
            [colorName]: {value: colors, size: 3, normalized: false},
            ...(LayerType === SolidPolygonLayer ? {indices: new Uint16Array([0, 1, 2])} : {})
          }
        }
      });
      manager.setLayers([layer]);
      const attribute = layer.getAttributeManager()!.attributes[attributeName];
      expect(attribute.settings.transform).toBeNull();
      expect(attribute.value).toBe(colors);
      expect(attribute.value![0]).toBeCloseTo(0.7, 6);
    } finally {
      manager.finalize();
    }
  });

  test(`${LayerType.layerName} removes styling transforms when refinement is disabled`, () => {
    const manager = new LayerManager(device, {viewport: new CustomProjectionViewport(options)});
    manager.setProps({
      onError: error => {
        throw error;
      }
    });
    let layer = new LayerType({
      id: 'refinement-styling-toggle',
      data: [
        [
          [0, 0],
          [1, 0],
          [1, 1]
        ]
      ],
      getPath: p => p,
      getPolygon: p => p,
      _projectionTolerance: 0
    });
    const names =
      LayerType === PathLayer
        ? ['instanceColors', 'instanceStrokeWidths']
        : ['fillColors', 'lineColors', 'elevations'];
    try {
      manager.setLayers([layer]);
      for (const tolerance of [0.1, 0]) {
        layer = layer.clone({_projectionTolerance: tolerance});
        manager.setLayers([layer]);
        for (const name of names) {
          const transform = layer.getAttributeManager()!.attributes[name].settings.transform;
          if (tolerance) expect(transform).toBeTypeOf('function');
          else expect(transform).toBeNull();
        }
      }
    } finally {
      manager.finalize();
    }
  });
}
