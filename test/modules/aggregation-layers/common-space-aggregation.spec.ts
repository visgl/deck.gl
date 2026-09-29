// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {
  LayerManager,
  Viewport,
  WebMercatorViewport,
  _GlobeViewport as GlobeViewport,
  _CustomProjectionViewport as CustomProjectionViewport
} from '@deck.gl/core';
import {
  GridLayer,
  HexagonLayer,
  ContourLayer,
  HeatmapLayer,
  ScreenGridLayer,
  CPUAggregator,
  WebGLAggregator
} from '@deck.gl/aggregation-layers';
import {device} from '@deck.gl/test-utils/vitest';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {Matrix4} from '@math.gl/core';
import {PathLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {getUniformsFromViewport} from '@deck.gl/core/shaderlib/project/viewport-uniforms';

const data = [
  [1, 2, 0],
  [3, 4, 0],
  [5, 6, 0],
  [7, 8, 0]
];
const modelMatrix = new Matrix4().translate([10, 20, 0]);
const project = ([x, y, z = 0]: number[]): [number, number, number] => [x * x, y * 3, z];
const normalizationScale = 512 / 40075016.6855;
// Use meter-scale projected extents so the data spans multiple aggregation cells.
const projectedUnit = 100000;
const getCommonData = (scale = 1) =>
  data.map(p =>
    project(modelMatrix.transformAsPoint(p)).map((value, i) =>
      i < 2 ? value * scale * projectedUnit * normalizationScale : value * scale
    )
  );
const commonData = getCommonData();

function createViewport(
  signature = 'initial',
  scale = 1,
  camera: {pitch?: number; bearing?: number; zoom?: number} = {}
) {
  const viewport = new CustomProjectionViewport({
    ...camera,
    width: 400,
    height: 300,
    toCrs: signature,
    fromCrs: '+units=m',
    // Isolate preprocessing from distortion while evaluating each requested data anchor.
    getDistanceScale: () => [normalizationScale, normalizationScale],
    projection: {
      forward: p => project(p).map((v, i) => v * scale * (i < 2 ? projectedUnit : 1)),
      inverse: ([x, y, z = 0]) => [
        Math.sqrt(x / (scale * projectedUnit)),
        y / (3 * scale * projectedUnit),
        z / scale
      ]
    }
  });
  // Count data preprojection, not constructor inverse validation.
  vi.spyOn(viewport, 'preproject');
  return viewport;
}

function createReferenceViewport(viewport: CustomProjectionViewport) {
  return new Viewport({
    width: viewport.width,
    height: viewport.height,
    position: viewport.center,
    viewMatrix: viewport.viewMatrixUncentered,
    projectionMatrix: viewport.projectionMatrix
  });
}

function createManager(viewport: Viewport, targetDevice = device) {
  const manager = new LayerManager(targetDevice, {viewport});
  manager.setProps({
    onError: error => {
      throw error;
    }
  });
  return manager;
}

test('CPU ScreenGrid projects packed attributes without repeating position transforms', () => {
  const viewports = [
    createViewport('screen', 1, {pitch: 35, bearing: 20}),
    new WebMercatorViewport({longitude: 0, latitude: 0, zoom: 4, width: 400, height: 300}),
    new GlobeViewport({longitude: 0, latitude: 0, zoom: 1, width: 400, height: 300}),
    new Viewport({width: 400, height: 300})
  ];
  for (const viewport of viewports) {
    for (const coordinateSystem of ['default', 'cartesian'] as const) {
      const manager = createManager(viewport);
      const point = [2, 3, 4];
      const layer = new ScreenGridLayer({
        data: [point],
        getPosition: p => p,
        coordinateSystem,
        coordinateOrigin: [10, 20, 30],
        modelMatrix: new Matrix4().translate([1, 2, 3]),
        gpuAggregation: false,
        cellSizePixels: 40
      });
      try {
        manager.setLayers([layer]);
        const [x, y] = layer.project(point);
        const expected =
          x < 0 || x >= viewport.width || y < 0 || y >= viewport.height
            ? null
            : [Math.floor(x / 40), Math.floor(y / 40)];
        const packed = Array.from(
          layer.getAttributeManager()!.attributes.positions.value!.slice(0, 3)
        );
        const preproject = viewport.preproject ? vi.spyOn(viewport, 'preproject') : null;
        preproject?.mockClear();
        const aggregator = layer.state.aggregator as CPUAggregator;
        const getBin = aggregator.props.getBin;
        if (typeof getBin === 'function') throw new Error('Expected a position accessor');
        expect(getBin.getValue({positions: packed}, 0, {cellSizePixels: 40})).toEqual(expected);
        if (preproject) expect(preproject).not.toHaveBeenCalled();
        expect(point).toEqual([2, 3, 4]);
      } finally {
        manager.finalize();
        vi.restoreAllMocks();
      }
    }
  }
});

for (const binary of [false, true]) {
  for (const aggregation of ['SUM', 'MEAN'] as const) {
    for (const gpuAggregation of [false, true]) {
      test(`ScreenGridLayer screen bins: gpu=${gpuAggregation}, binary=${binary}, aggregation=${aggregation}`, ({
        skip
      }) => {
        if (gpuAggregation && !WebGLAggregator.isSupported(device)) return skip();
        const points = [
          [-9, -18, 0],
          [-9, -18, 0],
          [1, 2, 3],
          [3, 4, 5],
          [1000, 1000, 0]
        ];
        const weights = [2, 4, 8, 16, 32];
        const cellSizePixels = 40;
        const initial = createViewport();
        const manager = createManager(initial);
        const layer = new ScreenGridLayer<number[]>({
          data: binary
            ? {
                length: points.length,
                attributes: {
                  getPosition: {value: new Float64Array(points.flat()), size: 3},
                  getWeight: {value: new Float32Array(weights), size: 1}
                }
              }
            : points,
          getPosition: p => p as [number, number, number],
          getWeight: (_, {index}) => weights[index],
          modelMatrix,
          coordinateSystem: 'lnglat-offsets',
          coordinateOrigin: [100, 200, 300],
          cellSizePixels,
          aggregation,
          gpuAggregation
        });
        const sortBins = (bins: {id: number[]; count: number; value: number[]}[]) =>
          bins.sort((a, b) => a.id[1] - b.id[1] || a.id[0] - b.id[0]);
        try {
          manager.setLayers([layer]);
          expect(layer.state.aggregator).toBeInstanceOf(
            gpuAggregation ? WebGLAggregator : CPUAggregator
          );
          for (const viewport of [
            initial,
            createViewport('initial', 1, {pitch: 35, bearing: 25, zoom: 0.3})
          ]) {
            manager.activateViewport(viewport);
            layer.activateViewport(viewport);
            manager.updateLayers();
            for (const devicePixelRatio of [1, 2]) {
              layer.state.aggregator.setNeedsUpdate();
              layer.draw({
                shaderModuleProps: {
                  project: {
                    viewport,
                    devicePixelRatio,
                    modelMatrix,
                    coordinateSystem: layer.props.coordinateSystem,
                    coordinateOrigin: layer.props.coordinateOrigin
                  }
                }
              } as any);
              const expected = new Map<string, {id: number[]; count: number; value: number[]}>();
              points.forEach((position, i) => {
                // Independent world-to-screen reference, not the ScreenGrid CPU aggregator.
                const [x, y] = viewport.project(modelMatrix.transformAsPoint(position));
                if (x < 0 || x >= viewport.width || y < 0 || y >= viewport.height) return;
                const id = [Math.floor(x / cellSizePixels), Math.floor(y / cellSizePixels)];
                const key = id.join(',');
                const bin = expected.get(key) || {id, count: 0, value: [0]};
                bin.count++;
                bin.value[0] += weights[i];
                expected.set(key, bin);
              });
              const expectedBins = Array.from(expected.values());
              expect(expectedBins.length).toBeGreaterThan(0);
              expect(expectedBins.reduce((sum, bin) => sum + bin.count, 0)).toBeLessThan(
                points.length
              );
              if (aggregation === 'MEAN') {
                for (const bin of expectedBins) bin.value[0] /= bin.count;
              }
              const aggregator = layer.state.aggregator;
              const actual = Array.from({length: aggregator.binCount}, (_, i) =>
                aggregator.getBin(i)
              )
                .filter(bin => bin && bin.count > 0)
                .map(bin => ({id: bin!.id, count: bin!.count, value: bin!.value}));
              expect(sortBins(actual)).toEqual(sortBins(expectedBins));
            }
          }
        } finally {
          manager.finalize();
          vi.restoreAllMocks();
        }
      });
    }
  }
}

test('ScreenGridLayer reuses packed positions across backend changes and WebGPU CPU fallback', async () => {
  for (const targetDevice of [device, await getWebGPUTestDevice()]) {
    if (!targetDevice) continue;
    const viewport = createViewport();
    const manager = createManager(viewport, targetDevice);
    const points = [
      [-9, -18, 0],
      [-9, -18, 0]
    ];
    const getPosition = vi.fn(p => p);
    let layer = new ScreenGridLayer({
      data: points,
      getPosition,
      modelMatrix,
      cellSizePixels: 40,
      gpuAggregation: false
    });
    try {
      manager.setLayers([layer]);
      const positions = layer.getAttributeManager()!.attributes.positions.value;
      getPosition.mockClear();
      vi.mocked(viewport.preproject!).mockClear();
      for (const gpuAggregation of [true, false, true]) {
        layer = layer.clone({gpuAggregation});
        manager.setLayers([layer]);
        const expectedType =
          gpuAggregation && WebGLAggregator.isSupported(targetDevice)
            ? WebGLAggregator
            : CPUAggregator;
        expect(layer.state.aggregator).toBeInstanceOf(expectedType);
        layer.draw({shaderModuleProps: {project: {viewport, modelMatrix}}} as any);
        expect(layer.getAttributeManager()!.attributes.positions.value).toBe(positions);
        expect(getPosition).not.toHaveBeenCalled();
        expect(viewport.preproject).not.toHaveBeenCalled();
        const aggregator = layer.state.aggregator;
        const bins = Array.from({length: aggregator.binCount}, (_, i) =>
          aggregator.getBin(i)
        ).filter(bin => bin && bin.count > 0);
        expect(bins).toHaveLength(1);
        expect(bins[0]).toMatchObject({id: [5, 3], count: 2, value: [2]});
      }
    } finally {
      manager.finalize();
      vi.restoreAllMocks();
    }
  }
});

for (const LayerType of [GridLayer, HexagonLayer, ContourLayer]) {
  test(`${LayerType.layerName} GPU aggregation matches preprojected Cartesian input`, ({skip}) => {
    if (!WebGLAggregator.isSupported(device)) {
      skip();
      return;
    }
    const viewport = createViewport();
    const cartesianViewport = createReferenceViewport(viewport);
    const manager = createManager(viewport);
    const referenceManager = createManager(cartesianViewport);
    const props = {getPosition: p => p, cellSize: 20, radius: 20, gpuAggregation: true};
    const layer = new LayerType({
      ...props,
      data,
      modelMatrix,
      coordinateSystem: 'lnglat-offsets',
      coordinateOrigin: [100, 200, 0]
    } as any);
    const reference = new LayerType({
      ...props,
      data: commonData,
      coordinateSystem: 'cartesian'
    } as any);
    const bins = (l: typeof layer) =>
      Array.from({length: l.state.aggregator.binCount}, (_, i) => l.state.aggregator.getBin(i));
    try {
      manager.setLayers([layer]);
      referenceManager.setLayers([reference]);
      expect(layer.state.aggregator).toBeInstanceOf(WebGLAggregator);
      for (const [current, currentViewport] of [
        [layer, viewport],
        [reference, cartesianViewport]
      ] as const) {
        current.draw({
          shaderModuleProps: {
            project: {
              viewport: currentViewport,
              modelMatrix: current.props.modelMatrix,
              coordinateSystem: current.props.coordinateSystem,
              coordinateOrigin: current.props.coordinateOrigin
            }
          }
        } as any);
      }
      expect(bins(layer)).toEqual(bins(reference));
      expect(bins(layer).reduce((sum, bin) => sum + bin!.count, 0)).toBe(data.length);
    } finally {
      manager.finalize();
      referenceManager.finalize();
    }
  });

  test(`${LayerType.layerName} aggregates preprojected positions like a non-geo view`, () => {
    const viewport = createViewport();
    const manager = createManager(viewport);
    const referenceManager = createManager(createReferenceViewport(viewport));
    const props = {
      getPosition: p => p,
      cellSize: 20,
      radius: 20,
      gpuAggregation: false,
      contours: [{threshold: 0.5}, {threshold: [0.5, 10]}]
    };
    let layer = new LayerType({
      ...props,
      data,
      modelMatrix,
      coordinateSystem: 'lnglat',
      coordinateOrigin: [100, 200, 0]
    } as any);
    const reference = new LayerType({
      ...props,
      data: commonData,
      coordinateSystem: 'cartesian'
    } as any);
    const bins = (l: typeof layer) =>
      Array.from({length: l.state.aggregator.binCount}, (_, i) => l.state.aggregator.getBin(i));
    try {
      manager.setLayers([layer]);
      referenceManager.setLayers([reference]);
      expect(bins(layer)).toEqual(bins(reference));
      // Only original data is projected. Contour output must never call preproject.
      expect(viewport.preproject).toHaveBeenCalledTimes(data.length);
      if (layer instanceof HexagonLayer && reference instanceof HexagonLayer) {
        const picking = {info: {index: 0}};
        const referencePosition = reference.getPickingInfo({info: {index: 0}} as any).object!
          .position;
        const worldPosition = layer.getPickingInfo(picking as any).object!.position;
        const expectedWorld = viewport.unprojectPosition(
          referencePosition.map((value, i) => value + layer.state.hexOriginCommon[i])
        );
        worldPosition.forEach((value, i) => expect(value).toBeCloseTo(expectedWorld[i], 8));
      }
      if (layer instanceof ContourLayer && reference instanceof ContourLayer) {
        expect(layer.state.contourData).toEqual(reference.state.contourData);
        expect(layer.getSubLayers()).toHaveLength(2);
        for (const child of layer.getSubLayers()) {
          expect(child.usePositionTransforms().transform).toBeNull();
          expect(child.props.coordinateSystem).toBe('cartesian');
          expect(child.projectPosition([2, 3, 0], {autoOffset: false})).toEqual(
            new Matrix4(child.props.modelMatrix!)
              .transformAsPoint([2, 3, 0])
              .map(value => value * normalizationScale)
          );
          const uniforms = getUniformsFromViewport({
            viewport,
            coordinateSystem: child.props.coordinateSystem,
            coordinateOrigin: child.props.coordinateOrigin,
            modelMatrix: child.props.modelMatrix
          });
          expect(uniforms.modelMatrix).toBe(child.props.modelMatrix);
        }
        expect(viewport.preproject).toHaveBeenCalledTimes(data.length);
      }

      // GPU binning uses a separate viewport, but must still ignore the consumed
      // layer matrix/origin and explicit geographic coordinate system.
      const setProps = vi.spyOn(layer.state.aggregator, 'setProps');
      const projectProps = {
        viewport,
        modelMatrix,
        coordinateSystem: 'lnglat',
        coordinateOrigin: [100, 200, 0],
        autoWrapLongitude: true
      };
      layer.draw({shaderModuleProps: {project: projectProps}} as any);
      const received = (setProps.mock.calls.at(-1)![0] as any).shaderModuleProps.project;
      expect(received).toMatchObject({
        coordinateSystem: 'cartesian',
        coordinateOrigin: [0, 0, 0],
        modelMatrix: null,
        autoWrapLongitude: false
      });
      const uniforms = getUniformsFromViewport(received);
      expect(Array.from(uniforms.modelMatrix)).toEqual(Array.from(new Matrix4()));
      expect(projectProps.modelMatrix).toBe(modelMatrix);

      const changed = createViewport('changed', 2);
      manager.activateViewport(changed);
      layer.activateViewport(changed);
      manager.updateLayers();
      layer = manager.getLayers().find(l => l.id === layer.id) as typeof layer;
      const updatedReference = reference.clone({data: getCommonData(2)});
      referenceManager.setLayers([updatedReference]);
      expect(bins(layer)).toEqual(bins(updatedReference));
    } finally {
      manager.finalize();
      referenceManager.finalize();
      vi.restoreAllMocks();
    }
  });
}

test('ContourLayer preserves Web Mercator common-space contour coordinates', () => {
  const viewport = new WebMercatorViewport({
    width: 400,
    height: 300,
    longitude: -122,
    latitude: 38,
    zoom: 12
  });
  const manager = createManager(viewport);
  const layer = new ContourLayer({
    data: [
      [-122, 38, 0],
      [-122.001, 38.001, 0]
    ],
    getPosition: p => p,
    cellSize: 200,
    gpuAggregation: false,
    contours: [{threshold: 0.5}, {threshold: [0.5, 10]}]
  });
  try {
    manager.setLayers([layer]);
    const children = layer.getSubLayers();
    expect(children).toHaveLength(2);
    const {cellOriginCommon, cellSizeCommon} = layer.state;
    const expectedMatrix = new Matrix4()
      .translate([cellOriginCommon[0], cellOriginCommon[1], 0])
      .scale([cellSizeCommon[0], cellSizeCommon[1], layer.props.zOffset]);
    for (const child of children) {
      expect(child.props.coordinateSystem).toBe('cartesian');
      expect(Array.from(child.props.modelMatrix!)).toEqual(Array.from(expectedMatrix));
    }
  } finally {
    manager.finalize();
  }
});

test('ContourLayer supports ordinary application-provided Cartesian sublayers', () => {
  class CustomPathLayer extends PathLayer {
    static layerName = 'CustomPathLayer';
  }
  class CustomPolygonLayer extends SolidPolygonLayer {
    static layerName = 'CustomPolygonLayer';
  }
  const viewport = createViewport();
  const manager = createManager(viewport);
  const layer = new ContourLayer({
    data,
    getPosition: p => p,
    modelMatrix,
    coordinateOrigin: [100, 200, 300],
    cellSize: 20,
    gpuAggregation: false,
    contours: [{threshold: 0.5}, {threshold: [0.5, 10]}],
    _subLayerProps: {
      lines: {type: CustomPathLayer},
      bands: {type: CustomPolygonLayer}
    }
  });
  try {
    manager.setLayers([layer]);
    const children = layer.getSubLayers();
    expect(children).toHaveLength(2);
    expect(children[0].constructor).toBe(CustomPathLayer);
    expect(children[1].constructor).toBe(CustomPolygonLayer);
    for (const child of children) {
      expect(child.props.coordinateSystem).toBe('cartesian');
      expect(child.props.coordinateOrigin).toEqual([0, 0, 0]);
      expect(child.usePositionTransforms().transform).toBeNull();
      const position = [2, 3, 4];
      expect(child.projectPosition(position, {autoOffset: false})).toEqual(
        new Matrix4(child.props.modelMatrix!)
          .transformAsPoint(position)
          .map(
            (value, axis) =>
              value * (axis === 2 ? viewport.distanceScales.unitsPerMeter[2] : normalizationScale)
          )
      );
    }
    expect(viewport.preproject).toHaveBeenCalledTimes(data.length);
  } finally {
    manager.finalize();
    vi.restoreAllMocks();
  }
});

for (const [LayerType, accessor] of [
  [GridLayer, 'gridAggregator'],
  [HexagonLayer, 'hexagonAggregator']
] as const) {
  test(`${LayerType.layerName} custom binning receives map-meter coordinates`, () => {
    const viewport = createViewport();
    const manager = createManager(viewport);
    const received: number[][] = [];
    const aggregate = (position: number[]) => {
      // The aggregator reuses its accessor target between rows.
      received.push(position.slice());
      return [0, 0];
    };
    const layer = new LayerType({
      data,
      modelMatrix,
      getPosition: p => p,
      gpuAggregation: false,
      [accessor]: aggregate
    } as any);
    try {
      manager.setLayers([layer]);
      expect(received).toEqual(
        data.map(p => viewport.preproject!(modelMatrix.transformAsPoint(p)))
      );
    } finally {
      manager.finalize();
    }
  });
}

test('HeatmapLayer uses the same bounds and texture coordinates as a non-geo view', () => {
  const viewport = createViewport();
  const manager = createManager(viewport);
  const referenceManager = createManager(createReferenceViewport(viewport));
  const props = {weightsTextureSize: 32, getPosition: p => p};
  const layer = new HeatmapLayer({...props, data, modelMatrix, coordinateSystem: 'lnglat'});
  const reference = new HeatmapLayer({...props, data: commonData, coordinateSystem: 'cartesian'});
  try {
    manager.setLayers([layer]);
    referenceManager.setLayers([reference]);
    expect(layer.state.worldBounds).toEqual(reference.state.worldBounds);
    expect(layer.state.normalizedCommonBounds).toEqual(reference.state.normalizedCommonBounds);
    expect(layer.state.viewportCorners).toEqual(reference.state.viewportCorners);
    expect(
      layer._worldToCommonBounds(layer.state.worldBounds, {useLayerCoordinateSystem: true})
    ).toEqual(
      reference._worldToCommonBounds(reference.state.worldBounds, {useLayerCoordinateSystem: true})
    );
    expect(viewport.preproject).toHaveBeenCalledTimes(data.length);

    const update = vi.spyOn(layer, '_updateWeightmap');
    const changed = createViewport('changed');
    manager.activateViewport(changed);
    layer.activateViewport(changed);
    manager.updateLayers();
    // Same camera/bounds still requires rebuilding when the projection changes.
    expect(update).toHaveBeenCalled();
    expect(layer.state.normalizedCommonBounds).toEqual(reference.state.normalizedCommonBounds);
  } finally {
    manager.finalize();
    referenceManager.finalize();
    vi.restoreAllMocks();
  }
});

for (const deviceType of ['webgl', 'webgpu']) {
  test(`HeatmapLayer refreshes Cartesian transforms by value: ${deviceType}`, async ({skip}) => {
    const targetDevice = deviceType === 'webgpu' ? await getWebGPUTestDevice() : device;
    if (!targetDevice) return skip();
    for (const viewport of [
      createViewport(),
      new WebMercatorViewport({width: 400, height: 300, zoom: 4})
    ]) {
      const manager = createManager(viewport, targetDevice);
      const getPosition = vi.fn(p => p);
      let layer = new HeatmapLayer({
        data,
        getPosition,
        coordinateSystem: 'cartesian',
        modelMatrix,
        coordinateOrigin: [10, 20, 30],
        weightsTextureSize: 32
      });
      try {
        manager.setLayers([layer]);
        const positions =
          layer.getAttributeManager()!.attributes[layer.state.positionAttributeName];
        const packedPositions = positions.value;
        const update = vi.spyOn(HeatmapLayer.prototype, '_updateWeightmap');
        layer = layer.clone({
          modelMatrix: new Matrix4(modelMatrix),
          coordinateOrigin: [10, 20, 30],
          // Exercise updateState while the transform values remain equal.
          opacity: 0.5
        });
        manager.setLayers([layer]);
        expect(update).not.toHaveBeenCalled();

        layer = layer.clone({coordinateOrigin: [40, 50, 60]});
        manager.setLayers([layer]);
        expect(update).toHaveBeenCalledTimes(1);

        layer = layer.clone({modelMatrix: new Matrix4().translate([40, 50, 60])});
        manager.setLayers([layer]);
        expect(update).toHaveBeenCalledTimes(2);
        expect(
          layer.getAttributeManager()!.attributes[layer.state.positionAttributeName].value
        ).toBe(packedPositions);
        expect(Array.from(packedPositions!.slice(0, data.length * 3))).toEqual(data.flat());
        expect(getPosition).toHaveBeenCalledTimes(data.length);
        update.mockRestore();
      } finally {
        manager.finalize();
        vi.restoreAllMocks();
      }
    }
  });
}

test('Cartesian aggregation bounds apply layer transforms before any viewport projection', () => {
  const viewport = new Viewport({
    width: 400,
    height: 300,
    preproject: position => position.map(value => value * 10),
    distanceScales: {unitsPerWorldUnit: [2, 3, 4]}
  });
  const manager = createManager(viewport);
  const layer = new ScreenGridLayer({
    data: [
      [1, 2, 3],
      [4, 6, 8]
    ],
    getPosition: p => p,
    coordinateSystem: 'cartesian',
    modelMatrix: new Matrix4().translate([10, 20, 30]).scale([2, 3, 4]),
    coordinateOrigin: [100, 200, 300],
    gpuAggregation: false
  });
  try {
    manager.setLayers([layer]);
    const projectPosition = vi.spyOn(layer, 'projectPosition');
    expect(layer.getBounds()).toEqual([
      [112, 226, 342],
      [118, 238, 362]
    ]);
    expect(projectPosition).not.toHaveBeenCalled();
    projectPosition.mockRestore();
  } finally {
    manager.finalize();
  }
});

for (const LayerType of [ScreenGridLayer, GridLayer, HexagonLayer, ContourLayer]) {
  for (const gpuAggregation of [false, true]) {
    test(`${LayerType.layerName} preserves Cartesian transforms in bins and bounds: gpu=${gpuAggregation}`, ({
      skip
    }) => {
      if (gpuAggregation && !WebGLAggregator.isSupported(device)) return skip();
      const viewport = new CustomProjectionViewport({
        width: 400,
        height: 300,
        zoom: 3,
        fromCrs: 'map-meters',
        projection: {forward: p => p, inverse: p => p},
        getDistanceScale: () => [1, 1]
      });
      const manager = createManager(viewport);
      const referenceManager = createManager(viewport);
      const points = [
        [-500000, 0, 0],
        [0, 100000, 0],
        [500000, 200000, 0]
      ];
      const matrix = new Matrix4().rotateZ(0.3).scale([2, 3, 1]);
      const preproject = vi.spyOn(viewport, 'preproject');
      let packedPositions;
      const getPosition = vi.fn(p => p);
      const snapshots = new Map<
        string,
        {bounds: ReturnType<typeof layer.getBounds>; bins: unknown}
      >();
      const props = {
        getPosition,
        coordinateSystem: 'cartesian',
        gpuAggregation,
        cellSize: 100000,
        radius: 100000,
        cellSizePixels: 10
      };
      let layer = new LayerType({
        ...props,
        data: points,
        modelMatrix: matrix,
        coordinateOrigin: [200000, 300000, 0]
      } as any);
      const bins = current =>
        Array.from({length: current.state.aggregator.binCount}, (_, i) =>
          current.state.aggregator.getBin(i)
        )
          .filter(bin => bin && bin.count > 0)
          .sort((a, b) => a.id[1] - b.id[1] || a.id[0] - b.id[0]);
      try {
        const origins = [
          [200000, 300000, 0],
          [700000, 800000, 0]
        ];
        for (const [origin, transform, useGPU] of [
          [origins[0], matrix, gpuAggregation],
          [origins[1], matrix, gpuAggregation],
          [
            origins[1],
            new Matrix4().translate([200000, 300000, 0]).multiplyRight(matrix),
            gpuAggregation
          ],
          // Switching backends must preserve packed positions and derive identical bounds and bins.
          ...(WebGLAggregator.isSupported(device)
            ? [
                [origins[1], matrix, !gpuAggregation],
                [origins[1], matrix, gpuAggregation]
              ]
            : [])
        ] as [number[], Matrix4, boolean][]) {
          layer = layer.clone({
            coordinateOrigin: origin,
            modelMatrix: transform,
            gpuAggregation: useGPU
          });
          const transformed = points.map(point =>
            transform.transformAsPoint(point).map((value, axis) => value + origin[axis])
          );
          const reference = new LayerType({
            ...props,
            data: transformed,
            getPosition: p => p,
            gpuAggregation: useGPU
          } as any);
          manager.setLayers([layer]);
          referenceManager.setLayers([reference]);
          const positions = layer.getAttributeManager()!.attributes.positions;
          expect(positions.settings.transform).toBeNull();
          expect(Array.from(positions.value!.slice(0, points.length * 3))).toEqual(points.flat());
          if (packedPositions) expect(positions.value).toBe(packedPositions);
          packedPositions = positions.value;
          expect(preproject).not.toHaveBeenCalled();
          expect(getPosition).toHaveBeenCalledTimes(points.length);
          const setProps = vi.spyOn(layer.state.aggregator, 'setProps');
          for (const current of [layer, reference]) {
            current.draw({
              shaderModuleProps: {
                project: {
                  viewport,
                  modelMatrix: current.props.modelMatrix,
                  coordinateOrigin: current.props.coordinateOrigin,
                  coordinateSystem: current.props.coordinateSystem
                }
              }
            } as any);
          }
          const received = (setProps.mock.calls.at(-1)![0] as any).shaderModuleProps.project;
          expect(received.modelMatrix).toBe(transform);
          expect(received.coordinateOrigin).toBe(origin);
          expect(received.coordinateSystem).toBe('cartesian');
          setProps.mockRestore();
          const snapshot = {
            bounds: layer.getBounds(),
            // CPU-only point indices are not part of GPU aggregation output.
            bins: bins(layer).map(({id, count, value}) => ({id, count, value}))
          };
          const key = JSON.stringify([origin, transform]);
          if (snapshots.has(key)) expect(snapshot).toEqual(snapshots.get(key));
          snapshots.set(key, snapshot);
          expect(bins(layer)).toEqual(bins(reference));
          expect(bins(layer).some(bin => bin?.count > 0)).toBe(true);
          const onAttributeChange = vi.spyOn(LayerType.prototype, 'onAttributeChange');
          layer = layer.clone({
            modelMatrix: new Matrix4(transform),
            coordinateOrigin: origin.slice(),
            // Force a props update while the transform values remain equal.
            opacity: layer.props.opacity === 1 ? 0.5 : 1
          });
          manager.setLayers([layer]);
          expect(onAttributeChange).not.toHaveBeenCalledWith('positions');
          onAttributeChange.mockRestore();
        }
        expect(points).toEqual([
          [-500000, 0, 0],
          [0, 100000, 0],
          [500000, 200000, 0]
        ]);
      } finally {
        manager.finalize();
        referenceManager.finalize();
        vi.restoreAllMocks();
      }
    });
  }
}

for (const LayerType of [GridLayer, HexagonLayer, ContourLayer]) {
  test(`${LayerType.layerName} keeps ground-meter bins stable after panning and data refresh`, () => {
    const options = {
      width: 400,
      height: 300,
      fromCrs: 'map-meters',
      projection: {forward: p => p, inverse: p => p},
      getDistanceScale: ([x, y]) => [1 + x / 1000000, 1 + y / 1000000] as [number, number]
    };
    const manager = createManager(new CustomProjectionViewport({...options, center: [0, 0, 0]}));
    const points = [
      [100000, 200000, 0],
      [300000, 400000, 0]
    ];
    let layer = new LayerType({
      data: points,
      getPosition: p => p,
      cellSize: 100000,
      radius: 100000,
      gpuAggregation: false
    } as any);
    try {
      manager.setLayers([layer]);
      const size =
        layer instanceof HexagonLayer ? layer.state.radiusCommon : layer.state.cellSizeCommon;
      const origin =
        layer instanceof HexagonLayer ? layer.state.hexOriginCommon : layer.state.cellOriginCommon;
      const expectedSizeX = (normalizationScale * 100000) / 1.2;
      if (layer instanceof HexagonLayer) {
        expect(size).toBeCloseTo(expectedSizeX, 10);
      } else {
        expect(size[0]).toBeCloseTo(expectedSizeX, 10);
        expect(size[1]).toBeCloseTo((normalizationScale * 100000) / 1.3, 10);
      }
      const viewport = new CustomProjectionViewport({...options, center: [800000, 900000, 0]});
      manager.activateViewport(viewport);
      layer = layer.clone({data: points.slice()});
      manager.setLayers([layer]);
      expect(
        layer instanceof HexagonLayer ? layer.state.radiusCommon : layer.state.cellSizeCommon
      ).toEqual(size);
      expect(
        layer instanceof HexagonLayer ? layer.state.hexOriginCommon : layer.state.cellOriginCommon
      ).toEqual(origin);
    } finally {
      manager.finalize();
    }
  });
}
