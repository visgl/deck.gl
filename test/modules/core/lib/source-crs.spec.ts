// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {
  Layer,
  LayerManager,
  Viewport,
  MapView,
  WebMercatorViewport,
  _GlobeViewport as GlobeViewport
} from '@deck.gl/core';
import {device} from '@deck.gl/test-utils/vitest';
import {projectionEngine} from '@math.gl/projection';
import type {CRSDescriptor} from '@math.gl/projection/core';
import {Matrix4} from '@math.gl/core';
import {addMetersToLngLat} from '@math.gl/web-mercator';
import DrawLayersPass from '@deck.gl/core/passes/draw-layers-pass';
import {resolveCRS, WGS84_CRS} from '@deck.gl/core/utils/crs';
import {supportsSourceCRS} from '@deck.gl/core/shaderlib/project/coordinate-systems';
import {PROJECTION_MODE} from '@deck.gl/core/shaderlib/project/constants';
import {getUniformsFromViewport} from '@deck.gl/core/shaderlib/project/viewport-uniforms';
import {GLOBE_CRS} from '@deck.gl/core/viewports/globe-util';
import {createTestCRS, createTestViewport} from '../viewports/test-crs';

class PositionLayer extends Layer {
  static layerName = 'SourceCRSPositionLayer';
  initializeState() {
    this.getAttributeManager()!.add({
      positions: {
        size: 3,
        accessor: 'getPosition',
        type: 'float64',
        ...this.usePositionTransforms()
      }
    });
  }
}

function deferredCRS() {
  let resolve!: (crs: CRSDescriptor) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<CRSDescriptor>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return {promise, resolve, reject};
}

const source = createTestCRS({
  signature: 'source',
  converter: {
    forward: ([x, y, z = 0]) => [x * 2, y * 3, z * 4],
    inverse: ([x, y, z = 0]) => [x / 2, y / 3, z / 4]
  }
});

function positions(layer: Layer) {
  return Array.from(layer.getAttributeManager()!.attributes.positions.value!.slice(0, 3));
}

test('GPU support describes attribute CRS rather than target CRS alone', () => {
  const custom = createTestCRS();
  for (const mode of [
    PROJECTION_MODE.WEB_MERCATOR,
    PROJECTION_MODE.WEB_MERCATOR_AUTO_OFFSET,
    PROJECTION_MODE.GLOBE
  ]) {
    expect(supportsSourceCRS(mode, WGS84_CRS, GLOBE_CRS)).toBe(true);
    expect(supportsSourceCRS(mode, GLOBE_CRS, GLOBE_CRS)).toBe(false);
    expect(supportsSourceCRS(mode, source, custom)).toBe(false);
  }
  expect(supportsSourceCRS(PROJECTION_MODE.CUSTOM_GEOSPATIAL, custom, custom)).toBe(true);
  expect(supportsSourceCRS(PROJECTION_MODE.CUSTOM_GEOSPATIAL, WGS84_CRS, custom)).toBe(false);
});

test('Viewport converts source CRS to packed CRS in both directions', async () => {
  const mercator = new WebMercatorViewport();
  const custom = createTestViewport({
    converter: {
      forward: ([x, y, z]) => [x + 100, y + 200, z],
      inverse: ([x, y, z]) => [x - 100, y - 200, z]
    }
  });
  const input = [20, 60, 120];
  const mercatorPair = mercator.getPreprojection(source);
  expect(mercatorPair.preproject!(input)).toEqual([10, 20, 30]);
  expect(mercatorPair.unpreproject!([10, 20, 30])).toEqual(input);
  const customPair = custom.getPreprojection(source);
  expect(customPair.preproject!(input)).toEqual([110, 220, 30]);
  expect(customPair.unpreproject!([110, 220, 30])).toEqual(input);
  expect(mercator.getPreprojection(WGS84_CRS).preproject).toBeNull();
  expect(custom.getPreprojection(custom.crs!).preproject).toBeNull();
  const globe = new GlobeViewport();
  for (const crs of [GLOBE_CRS, await resolveCRS('EPSG:4978')]) {
    const pair = globe.getPreprojection(crs!);
    const point = crs!.converter.WGS84.from([30, 40, 100]);
    pair.preproject!(Array.from(point)).forEach((value, axis) =>
      expect(value).toBeCloseTo([30, 40, 100][axis], 6)
    );
  }
});

test('Pending source CRS blocks lifecycle and transfers readiness to the latest clone', async () => {
  const request = deferredCRS();
  const getCRS = vi.spyOn(projectionEngine, 'getCRS').mockReturnValue(request.promise);
  const manager = new LayerManager(device, {viewport: new WebMercatorViewport()});
  let layer = new PositionLayer({
    id: 'pending-source',
    coordinateSystem: 'test:pending',
    data: [[20, 60, 120]],
    getPosition: p => p
  });
  const initialize = vi.spyOn(PositionLayer.prototype, 'initializeState');
  const update = vi.spyOn(PositionLayer.prototype, 'updateState');
  try {
    manager.setLayers([layer]);
    expect(layer.internalState).toBeNull();
    expect(layer.isLoaded).toBe(false);
    layer._update();
    manager.updateLayers();
    expect(initialize).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    layer = layer.clone({
      modelMatrix: new Matrix4().translate([2, 3, 4]),
      coordinateOrigin: [2, 3, 4]
    });
    manager.setLayers([layer]);
    request.resolve(source);
    await resolveCRS('test:pending');
    manager.updateLayers();
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(layer.isLoaded).toBe(true);
    expect(layer.state.sourceCrs).toBe(source);
    expect(layer.state.packedCrs).toBe(WGS84_CRS);
    expect(positions(layer)).toEqual([12, 22, 32]);
    const previous = layer;
    layer = layer.clone({coordinateSystem: 'WGS84'});
    manager.setLayers([layer]);
    expect(layer.getAttributeManager()).toBe(previous.getAttributeManager());
    expect(layer.state.preproject).toBeNull();
    expect(positions(layer)).toEqual([20, 60, 120]);
  } finally {
    manager.finalize();
    vi.restoreAllMocks();
  }
});

test('Stale and removed source CRS requests cannot update layers', async () => {
  const request = deferredCRS();
  const getCRS = vi.spyOn(projectionEngine, 'getCRS').mockReturnValue(request.promise);
  const manager = new LayerManager(device, {viewport: new WebMercatorViewport()});
  const pending = new PositionLayer({id: 'stale-source', coordinateSystem: 'test:stale'});
  try {
    manager.setLayers([pending]);
    const loaded = pending.clone({coordinateSystem: 'lnglat'});
    manager.setLayers([loaded]);
    request.resolve(source);
    await resolveCRS('test:stale');
    manager.updateLayers();
    expect(loaded.state.sourceCrs).toBe(WGS84_CRS);
    const removed = deferredCRS();
    getCRS.mockReturnValue(removed.promise);
    manager.setLayers([new PositionLayer({coordinateSystem: 'test:removed'})]);
    manager.setLayers([]);
    manager.needsUpdate();
    const needsUpdate = vi.spyOn(LayerManager.prototype, 'setNeedsUpdate');
    removed.resolve(source);
    await resolveCRS('test:removed');
    expect(needsUpdate).not.toHaveBeenCalled();
  } finally {
    manager.finalize();
    vi.restoreAllMocks();
  }
});

test('CRS resolution failure is reported through layer.raiseError without initializing', async () => {
  const request = deferredCRS();
  vi.spyOn(projectionEngine, 'getCRS').mockReturnValue(request.promise);
  const manager = new LayerManager(device, {viewport: new WebMercatorViewport()});
  const onError = vi.fn();
  manager.setProps({onError});
  const layer = new PositionLayer({coordinateSystem: 'test:invalid'});
  const raiseError = vi.spyOn(layer, 'raiseError');
  try {
    manager.setLayers([layer]);
    const error = new Error('Invalid CRS');
    request.reject(error);
    await expect(resolveCRS('test:invalid')).rejects.toBe(error);
    expect(raiseError).toHaveBeenCalledWith(error, 'loading coordinateSystem');
    expect(onError).toHaveBeenCalledTimes(1);
    expect(layer.internalState).toBeNull();
    expect(layer.isLoaded).toBe(false);
  } finally {
    manager.finalize();
    vi.restoreAllMocks();
  }
});

test('An initialized layer also waits when its new source CRS is pending', async () => {
  const request = deferredCRS();
  vi.spyOn(projectionEngine, 'getCRS').mockReturnValue(request.promise);
  const manager = new LayerManager(device, {viewport: new WebMercatorViewport()});
  let layer = new PositionLayer({
    id: 'initialized-source',
    data: [[20, 60, 120]],
    getPosition: p => p
  });
  try {
    manager.setLayers([layer]);
    const attributes = layer.getAttributeManager();
    const update = vi.spyOn(PositionLayer.prototype, 'updateState');
    layer = layer.clone({coordinateSystem: 'test:initialized-pending'});
    manager.setLayers([layer]);
    layer._update();
    layer.activateViewport(new WebMercatorViewport({longitude: 10}));
    expect(update).not.toHaveBeenCalled();
    expect(positions(layer)).toEqual([20, 60, 120]);
    request.resolve(source);
    await resolveCRS('test:initialized-pending');
    manager.updateLayers();
    expect(update).toHaveBeenCalledTimes(1);
    expect(layer.getAttributeManager()).toBe(attributes);
    expect(positions(layer)).toEqual([10, 20, 30]);
  } finally {
    manager.finalize();
    vi.restoreAllMocks();
  }
});

test('A layer in the custom viewport target CRS retains native attributes and GPU transforms', () => {
  const viewport = createTestViewport();
  const manager = new LayerManager(device, {viewport});
  const layer = new PositionLayer({
    coordinateSystem: viewport.crs!.signature,
    data: [[1, 2, 3]],
    getPosition: p => p,
    modelMatrix: new Matrix4().translate([10, 20, 30]),
    coordinateOrigin: [4, 5, 6]
  });
  try {
    manager.setLayers([layer]);
    expect(layer.isLoaded).toBe(true);
    expect(layer.state.sourceCrs).toBe(viewport.crs);
    expect(layer.state.preproject).toBeNull();
    expect(positions(layer)).toEqual([1, 2, 3]);
    expect(layer.projectPosition([1, 2, 3], {autoOffset: false})).toEqual(
      [15, 27, 39].map((value, axis) => value * viewport.distanceScales.unitsPerWorldUnit[axis])
    );
  } finally {
    manager.finalize();
  }
});

test('Viewport projects a declared source CRS independently of attribute packing', () => {
  for (const viewport of [new WebMercatorViewport(), new GlobeViewport(), createTestViewport()]) {
    const geographic = [10, 20, 30];
    const sourcePosition = source.converter.WGS84.from(geographic);
    const expected = viewport.projectPosition(geographic);
    expect(viewport.projectPosition(sourcePosition, {sourceCrs: source})).toEqual(expected);
    expect(viewport.projectPosition(geographic, {sourceCrs: WGS84_CRS})).toEqual(expected);
    const targetPosition = viewport.crs!.converter.WGS84.from(geographic);
    const actual = viewport.projectPosition(targetPosition, {sourceCrs: viewport.crs!});
    for (let axis = 0; axis < 3; axis++) expect(actual[axis]).toBeCloseTo(expected[axis], 7);
  }
});

test('CPU-packed WGS84 attributes survive camera, precision and built-in target changes', () => {
  const initial = new WebMercatorViewport({zoom: 11});
  const manager = new LayerManager(device, {viewport: initial});
  const getPosition = vi.fn(p => p);
  let layer = new PositionLayer({coordinateSystem: 'globe', data: [[6370972, 0, 0]], getPosition});
  try {
    manager.setLayers([layer]);
    layer.activateViewport(initial);
    getPosition.mockClear();
    for (const viewport of [
      new WebMercatorViewport({zoom: 13}),
      new GlobeViewport({resolution: 20}),
      new GlobeViewport({resolution: 60}),
      new WebMercatorViewport({zoom: 4})
    ]) {
      manager.activateViewport(viewport);
      layer.activateViewport(viewport);
      layer = layer.clone({});
      manager.setLayers([layer]);
      expect(layer.state.packedCrs).toBe(WGS84_CRS);
      expect(getPosition).not.toHaveBeenCalled();
    }
  } finally {
    manager.finalize();
  }
});

test('Pending target CRS retains attributes until its viewport is materialized', () => {
  const initial = createTestViewport({id: 'primary', signature: 'old-target'});
  const secondary = new WebMercatorViewport({id: 'secondary'});
  const manager = new LayerManager(device, {viewport: initial});
  const getPosition = vi.fn(p => p);
  let layer = new PositionLayer({data: [[2, 3, 4]], getPosition});
  try {
    manager.setLayers([layer]);
    layer.activateViewport(initial);
    getPosition.mockClear();
    manager.setViewports(
      [secondary],
      [new MapView({id: 'primary'}), new MapView({id: 'secondary'})]
    );
    layer = layer.clone({data: [[3, 4, 5]]});
    manager.setLayers([layer]);
    manager.activateViewport(secondary);
    layer.activateViewport(secondary);
    layer._update();
    expect(getPosition).not.toHaveBeenCalled();
    expect(layer.internalState!.viewport).toBe(initial);
    const replacement = createTestViewport({id: 'primary', signature: 'new-target'});
    manager.setViewports(
      [replacement, secondary],
      [new MapView({id: 'primary'}), new MapView({id: 'secondary'})]
    );
    manager.updateLayers();
    expect(getPosition).toHaveBeenCalledTimes(1);
    expect(layer.internalState!.viewport).toBe(replacement);
  } finally {
    manager.finalize();
  }
});

test('Initial viewport selects projection context without freezing subsequent render activation', () => {
  const first = new Viewport({id: 'local'});
  const selected = createTestViewport({id: 'selected'});
  const next = createTestViewport({id: 'next', longitude: 10});
  const manager = new LayerManager(device, {viewport: first});
  const layer = new PositionLayer({data: [[2, 3, 4]], getPosition: p => p});
  const activation = vi.spyOn(layer, 'activateViewport');
  const initializeState = layer.initializeState.bind(layer);
  const initialize = vi.spyOn(layer, 'initializeState').mockImplementation(() => {
    expect(layer.context.viewport).toBe(selected);
    expect(layer.internalState!.viewport).toBe(selected);
    initializeState();
  });
  manager.setViewports(
    [first, selected],
    [new MapView({id: 'local'}), new MapView({id: 'selected'})]
  );
  manager.setProps({layerFilter: ({viewport}) => viewport.id === 'selected'});
  try {
    manager.setLayers([layer]);
    expect(activation).not.toHaveBeenCalled();
    expect(initialize).toHaveBeenCalledOnce();
    expect(manager.context.viewport).toBe(first);
    expect(layer.internalState!.viewport).toBe(selected);
    expect(layer.state.sourceCrs).toBe(WGS84_CRS);
    expect(layer.state.preproject).toBeTypeOf('function');
    const pass = new DrawLayersPass(device);
    pass.render({
      pass: 'screen',
      layers: [layer],
      viewports: [next],
      onViewportActive: manager.activateViewport
    });
    expect(layer.internalState!.viewport).toBe(next);
    expect(activation).toHaveBeenLastCalledWith(next);
  } finally {
    manager.finalize();
  }
});

test('No matching initial viewport leaves the stored viewport empty', () => {
  const viewport = new WebMercatorViewport();
  const manager = new LayerManager(device, {viewport});
  const layer = new PositionLayer({data: [[2, 3, 4]], getPosition: p => p});
  const activation = vi.spyOn(layer, 'activateViewport');
  manager.setProps({layerFilter: () => false});
  try {
    manager.setLayers([layer]);
    expect(layer.internalState).toBeTruthy();
    expect(layer.internalState!.viewport).toBeUndefined();
    expect(activation).not.toHaveBeenCalled();
  } finally {
    manager.finalize();
  }
});

test('Multi-view layers retain the first eligible viewport across frames and clones', () => {
  const first = createTestViewport({id: 'first', signature: 'first'});
  const second = createTestViewport({id: 'second', signature: 'second'});
  const third = createTestViewport({id: 'third', signature: 'third'});
  const manager = new LayerManager(device, {viewport: first});
  const pass = new DrawLayersPass(device);
  const getPosition = vi.fn(p => p);
  let layer = new PositionLayer({data: [[2, 3, 4]], getPosition});
  const draw = () =>
    pass.render({
      pass: 'screen',
      layers: manager.getLayers(),
      viewports: [first, second, third],
      onViewportActive: manager.activateViewport,
      layerFilter: ({viewport}) => viewport.id !== 'first'
    });
  try {
    manager.setLayers([layer]);
    draw();
    expect(layer.internalState!.viewport).toBe(second);
    getPosition.mockClear();
    for (let i = 0; i < 3; i++) {
      layer = layer.clone({});
      manager.setLayers([layer]);
      draw();
      expect(layer.internalState!.viewport).toBe(second);
      expect(getPosition).not.toHaveBeenCalled();
    }
  } finally {
    manager.finalize();
  }
});

const geographicCRS = {
  type: 'GeographicCRS',
  name: 'WGS 84',
  datum: {
    type: 'GeodeticReferenceFrame',
    name: 'World Geodetic System 1984',
    ellipsoid: {name: 'WGS 84', semi_major_axis: 6378137, inverse_flattening: 298.257223563}
  },
  coordinate_system: {
    subtype: 'ellipsoidal',
    axis: [
      {name: 'Longitude', abbreviation: 'lon', direction: 'east', unit: 'degree'},
      {name: 'Latitude', abbreviation: 'lat', direction: 'north', unit: 'degree'}
    ]
  }
} as const;

test('Structured layer CRS resolves before initialization and compares by definition key', async () => {
  const definition = {...geographicCRS, name: 'Layer structured CRS regression'};
  const manager = new LayerManager(device, {viewport: new WebMercatorViewport()});
  manager.setProps({
    onError: error => {
      throw error;
    }
  });
  let layer = new PositionLayer({
    coordinateSystem: definition,
    data: [[20, 30, 0]],
    getPosition: p => p
  });
  try {
    manager.setLayers([layer]);
    expect(layer.internalState).toBeNull();
    await resolveCRS(definition);
    manager.updateLayers();
    expect(layer.isLoaded).toBe(true);
    layer.validateProps();
    const update = vi.spyOn(PositionLayer.prototype, 'updateState');
    const projectionProps = {
      viewport: manager.context.viewport!,
      coordinateSystem: definition
    };
    const expectedUniforms = getUniformsFromViewport(projectionProps);
    const stringify = vi.spyOn(JSON, 'stringify');
    const projected = layer.projectPosition([20, 30, 0], {autoOffset: false});
    const expected = manager.context.viewport!.projectPosition([20, 30, 0]);
    projected.forEach((value, axis) => expect(value).toBeCloseTo(expected[axis], 6));
    layer.projectPosition([21, 31, 0]);
    expect(
      getUniformsFromViewport({
        ...projectionProps,
        sourceCrs: layer.internalState!.sourceCrs
      })
    ).toEqual(expectedUniforms);
    expect(stringify).not.toHaveBeenCalled();
    layer = layer.clone();
    manager.setLayers([layer]);
    expect(stringify.mock.calls.some(([value]) => value === definition)).toBe(false);
    stringify.mockRestore();
    layer = layer.clone({coordinateSystem: structuredClone(definition)});
    manager.setLayers([layer]);
    expect(update).not.toHaveBeenCalled();

    // A different key still raises projectionChanged when it resolves to the same descriptor.
    const getCRS = vi.spyOn(projectionEngine, 'getCRS').mockResolvedValue(layer.state.sourceCrs!);
    const changed = {...definition, name: 'Changed layer CRS key'};
    layer = layer.clone({coordinateSystem: changed});
    manager.setLayers([layer]);
    expect(update).not.toHaveBeenCalled();
    expect(layer.internalState!.changeFlags.projectionChanged).toBe(true);
    await resolveCRS(changed);
    manager.updateLayers();
    expect(update).toHaveBeenCalledOnce();
    expect(getCRS).toHaveBeenCalledOnce();
  } finally {
    manager.finalize();
    vi.restoreAllMocks();
  }
});

test('Projection overrides define the input coordinates and automatic reference', () => {
  const viewport = new WebMercatorViewport({longitude: 30, latitude: 40, zoom: 14});
  const manager = new LayerManager(device, {viewport});
  const layer = new PositionLayer({
    coordinateSystem: 'meter-offsets',
    coordinateOrigin: [10, 20, 0]
  });
  try {
    manager.setLayers([layer]);
    const point = [11, 21, 0];
    const absolute = viewport.projectPosition(point);
    const {commonOrigin: origin} = getUniformsFromViewport({viewport, coordinateSystem: 'lnglat'});
    const options = {
      sourceCrs: WGS84_CRS,
      coordinateOrigin: [0, 0, 0] as [number, number, number],
      modelMatrix: null
    };
    expect(layer.projectPosition(point, options)).toEqual(
      absolute.map((value, axis) => value - origin[axis])
    );
    expect(layer.projectPosition(point, {...options, autoOffset: false})).toEqual(absolute);
    expect(layer.projectPosition([0, 0, 0], {coordinateOrigin: [11, 22, 0]})).toEqual([0, 0, 0]);
    expect(
      layer.projectPosition([0, 0, 0], {
        coordinateOrigin: [11, 22, 0],
        autoOffset: false
      })
    ).toEqual(viewport.projectPosition([11, 22, 0]));
    expect(layer.props.coordinateOrigin).toEqual([10, 20, 0]);
    expect(layer.internalState!.sourceCrs).toBeNull();
  } finally {
    manager.finalize();
  }
});

test('Explicit local and meter-offset modes take precedence over an absolute source CRS', () => {
  const viewport = new WebMercatorViewport({longitude: 30, latitude: 40, zoom: 14});
  const manager = new LayerManager(device, {viewport});
  const coordinateOrigin: [number, number, number] = [10, 20, 30];
  const layer = new PositionLayer({coordinateSystem: 'lnglat', coordinateOrigin});
  const point = [1, 2, 3];
  try {
    manager.setLayers([layer]);
    const defaultPosition = layer.projectPosition(point);
    for (const sourceCrs of [undefined, WGS84_CRS]) {
      expect(
        layer.projectPosition(point, {
          coordinateSystem: 'cartesian',
          sourceCrs,
          autoOffset: false
        })
      ).toEqual([11, 22, 33]);
      expect(
        layer.projectPosition(point, {
          coordinateSystem: 'meter-offsets',
          sourceCrs,
          autoOffset: false
        })
      ).toEqual(viewport.projectPosition(addMetersToLngLat(coordinateOrigin, point)));
    }
    expect(layer.projectPosition(point)).toEqual(defaultPosition);
    expect(layer.internalState!.sourceCrs).toBe(WGS84_CRS);
  } finally {
    manager.finalize();
  }
});

test('Local projection overrides ignore unsupported source CRS on CPU and GPU paths', () => {
  const viewport = createTestViewport({longitude: 30, latitude: 40});
  const manager = new LayerManager(device, {viewport});
  const layer = new PositionLayer({coordinateSystem: 'lnglat'});
  const unusedCrs = createTestCRS({
    signature: 'unused',
    converter: {
      forward: () => {
        throw new Error('Local coordinates must not be converted');
      },
      inverse: () => {
        throw new Error('Local coordinates must not be converted');
      }
    }
  });
  try {
    manager.setLayers([layer]);
    for (const coordinateSystem of ['cartesian', 'meter-offsets'] as const) {
      const params = {coordinateSystem, coordinateOrigin: [10, 20, 0] as [number, number, number]};
      for (const autoOffset of [false, true]) {
        expect(
          layer.projectPosition([1, 2, 3], {...params, autoOffset, sourceCrs: unusedCrs})
        ).toEqual(layer.projectPosition([1, 2, 3], {...params, autoOffset}));
      }
      expect(getUniformsFromViewport({viewport, ...params, sourceCrs: unusedCrs})).toEqual(
        getUniformsFromViewport({viewport, ...params, sourceCrs: null})
      );
    }
  } finally {
    manager.finalize();
  }
});
