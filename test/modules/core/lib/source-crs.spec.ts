// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {
  Layer,
  LayerManager,
  WebMercatorViewport,
  _GlobeViewport as GlobeViewport
} from '@deck.gl/core';
import {device} from '@deck.gl/test-utils/vitest';
import {projectionEngine} from '@math.gl/projection';
import type {CRSDescriptor} from '@math.gl/projection/core';
import {Matrix4} from '@math.gl/core';
import {resolveCRS, WGS84_CRS} from '@deck.gl/core/utils/crs';
import {supportsSourceCRS} from '@deck.gl/core/shaderlib/project/coordinate-systems';
import {PROJECTION_MODE} from '@deck.gl/core/shaderlib/project/constants';
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
