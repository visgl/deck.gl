// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {createProjectionEngine} from '@math.gl/geospatial/projection/core';
import {equalEarth} from '@math.gl/geospatial/projection/projections/eqearth';
import {
  Deck,
  Layer,
  LayerManager,
  WebMercatorViewport,
  _CustomProjectionView as CustomProjectionView
} from '@deck.gl/core';
import ViewManager from '@deck.gl/core/lib/view-manager';
import {
  defaultProjectionEngine,
  getProjectionEngine,
  getProjectionExecutionKey,
  resolveCRS,
  WGS84_CRS
} from '@deck.gl/core/utils/crs';
import type {CRSEngine, CRSDescriptor} from '@math.gl/geospatial/projection/core';
import {device} from '@deck.gl/test-utils/vitest';
import {createTestCRS} from '../viewports/test-crs';

function engine(getCRS: CRSEngine['getCRS']): CRSEngine {
  return {
    getCRS,
    createProjection: defaultProjectionEngine.createProjection.bind(defaultProjectionEngine),
    createProjectionAsync:
      defaultProjectionEngine.createProjectionAsync.bind(defaultProjectionEngine)
  };
}
function descriptor(factor: number) {
  return createTestCRS({
    signature: 'same-crs',
    converter: {
      forward: ([x, y, z = 0]) => [x * factor, y, z],
      inverse: ([x, y, z = 0]) => [x / factor, y, z]
    }
  });
}
const viewState = {center: [0, 0, 0], zoom: 0};
const dimensions = {width: 400, height: 300, viewState};
const flush = async () => {
  for (let i = 0; i < 8; i++) await Promise.resolve();
};

test('Deck defaults to math.gl and validates injected factories', () => {
  expect(Deck.defaultProps.projectionEngine).toBe(defaultProjectionEngine);
  expect(getProjectionEngine(null)).toBe(defaultProjectionEngine);
  expect(() => getProjectionEngine({getCRS() {}} as any)).toThrow('projectionEngine');
  expect(() => new Deck({projectionEngine: {} as CRSEngine})).toThrow('projectionEngine');
});

test('CRS resolution is shared within a factory and isolated across factories', async () => {
  const source = descriptor(1);
  const a = engine(vi.fn(async () => source));
  const b = engine(vi.fn(async () => source));
  const pending = resolveCRS('engine-test', a);
  expect(resolveCRS('engine-test', a)).toBe(pending);
  const [first, second] = await Promise.all([pending, resolveCRS('engine-test', b)]);
  expect(resolveCRS('engine-test', a)).toBe(first);
  expect(a.getCRS).toHaveBeenCalledTimes(1);
  expect(b.getCRS).toHaveBeenCalledTimes(1);
  expect(getProjectionExecutionKey(first!)).not.toBe(getProjectionExecutionKey(second!));
  expect(first!.converter).toBe(source.converter);
  expect(first!.executionIdentity).toBe(source.executionIdentity);
  expect(resolveCRS('lnglat', a)).toBe(WGS84_CRS);
  expect(resolveCRS('cartesian', a)).toBeNull();
});

test('injected resolution failures can retry without affecting another factory', async () => {
  const a = engine(
    vi.fn().mockRejectedValueOnce(new Error('grid unavailable')).mockResolvedValue(descriptor(1))
  );
  const b = engine(vi.fn(async () => descriptor(2)));
  await expect(resolveCRS('retry-engine', a)).rejects.toThrow('grid unavailable');
  const other = await resolveCRS('retry-engine', b);
  expect(await resolveCRS('retry-engine', a)).not.toBe(other);
  expect(a.getCRS).toHaveBeenCalledTimes(2);
});

test('shared custom views remain isolated and engine replacement discards stale results', async () => {
  let complete!: (crs: CRSDescriptor) => void;
  const a = engine(
    vi.fn(
      () =>
        new Promise(resolve => {
          complete = resolve;
        })
    )
  );
  const b = engine(vi.fn(async () => descriptor(2)));
  const shared = new CustomProjectionView({id: 'map', crs: 'engine-view'});
  const first = new ViewManager({views: [shared], projectionEngine: a, ...dimensions});
  const second = new ViewManager({views: [shared], projectionEngine: b, ...dimensions});
  try {
    await flush();
    second.updateViewports();
    const secondViewport = second.getViewports()[0];
    expect(secondViewport.crs!.converter.WGS84.from([3, 0])).toEqual([6, 0, 0]);
    expect(first.getViewports()).toHaveLength(0);
    first.setProps({projectionEngine: b});
    expect(first.getViewports()).toHaveLength(1);
    complete(descriptor(1));
    await flush();
    first.updateViewports();
    expect(first.getViewports()[0].crs).toBe(secondViewport.crs);
    expect(second.getViewports()[0]).toBe(secondViewport);
    first.setProps({projectionEngine: null, views: [new CustomProjectionView({crs: 'EPSG:3857'})]});
    await flush();
    await resolveCRS('EPSG:3857');
    await flush();
    first.updateViewports();
    expect(first.getViewports()[0].crs!.projection).toBe('merc');
  } finally {
    first.finalize();
    second.finalize();
  }
});

test('prepared view descriptors bypass the injected engine', () => {
  const prepared = descriptor(3);
  const factory = engine(
    vi.fn(async () => {
      throw new Error('must not resolve');
    })
  );
  const manager = new ViewManager({
    views: [new CustomProjectionView({crs: prepared})],
    projectionEngine: factory,
    ...dimensions
  });
  try {
    expect(manager.getViewports()[0].crs).toBe(prepared);
    expect(factory.getCRS).not.toHaveBeenCalled();
  } finally {
    manager.finalize();
  }
});

class PositionLayer extends Layer {
  static layerName = 'EnginePositionLayer';
  static defaultProps = {getPosition: {type: 'accessor', value: p => p}};
  initializeState() {
    this.getAttributeManager()!.addInstanced({
      positions: {
        size: 3,
        type: 'float64',
        accessor: 'getPosition',
        ...this.usePositionTransforms()
      }
    });
  }
}

test('engine replacement refreshes source conversion under a built-in view', async () => {
  const a = engine(vi.fn(async () => descriptor(2)));
  const b = engine(vi.fn(async () => descriptor(4)));
  const manager = new LayerManager(device, {
    viewport: new WebMercatorViewport({width: 400, height: 300}),
    projectionEngine: a
  });
  manager.setProps({
    onError: error => {
      throw error;
    }
  });
  const layer = new PositionLayer({
    id: 'source',
    data: [[8, 3, 0]],
    coordinateSystem: 'engine-source'
  });
  try {
    manager.setLayers([layer]);
    await flush();
    manager.updateLayers();
    const values = () =>
      Array.from(layer.getAttributeManager()!.getAttributes().positions.value!.slice(0, 3));
    expect(values()).toEqual([4, 3, 0]);
    expect(layer.context.projectionEngine).toBe(a);
    manager.setProps({projectionEngine: b});
    manager.updateLayers();
    await flush();
    manager.updateLayers();
    expect(values()).toEqual([2, 3, 0]);
    expect(layer.context.projectionEngine).toBe(b);
    expect(a.getCRS).toHaveBeenCalledTimes(1);
    expect(b.getCRS).toHaveBeenCalledTimes(1);
  } finally {
    manager.finalize();
  }
});

test('Deck forwards the engine at creation and replacement without taking ownership', async () => {
  const a = {...engine(vi.fn(async () => descriptor(2))), dispose: vi.fn()};
  const b = {...engine(vi.fn(async () => descriptor(4))), dispose: vi.fn()};
  const errors = vi.fn();
  const layer = new PositionLayer({
    id: 'deck-engine-source',
    data: [[8, 3, 0]],
    coordinateSystem: 'deck-source'
  });
  const deck = new Deck({
    device,
    width: 400,
    height: 300,
    views: new CustomProjectionView({crs: 'deck-target'}),
    initialViewState: viewState,
    projectionEngine: a,
    layers: [layer],
    onError: errors
  });
  try {
    await vi.waitFor(() => expect(layer.isLoaded && Boolean(layer.internalState)).toBe(true));
    expect(layer.context.projectionEngine).toBe(a);
    expect(deck.getViewports()[0].crs!.converter.WGS84.from([3, 0])).toEqual([6, 0, 0]);
    deck.setProps({projectionEngine: b});
    await vi.waitFor(() => {
      expect(deck.getViewports()[0]?.crs!.converter.WGS84.from([3, 0])).toEqual([12, 0, 0]);
      expect(layer.isLoaded).toBe(true);
      expect(layer.context.projectionEngine).toBe(b);
    });
    expect(errors).not.toHaveBeenCalled();
  } finally {
    deck.finalize();
  }
  expect(a.dispose).not.toHaveBeenCalled();
  expect(b.dispose).not.toHaveBeenCalled();
});

test('a configured math.gl factory resolves only its registered target projection', async () => {
  const factory = createProjectionEngine({projections: [equalEarth]});
  const view = new CustomProjectionView({crs: '+proj=eqearth +datum=WGS84 +units=m'});
  await view.initialize({projectionEngine: factory});
  const viewport = view.makeViewport(dimensions)!;
  const point = [12, 45, 0];
  viewport
    .unprojectPosition(viewport.projectPosition(point))
    .forEach((value, i) => expect(value).toBeCloseTo(point[i], 6));
});

test('standalone view initialization cannot publish a superseded engine result', async () => {
  let complete!: (crs: CRSDescriptor) => void;
  const a = engine(
    () =>
      new Promise(resolve => {
        complete = resolve;
      })
  );
  const b = engine(async () => descriptor(4));
  const view = new CustomProjectionView({crs: 'standalone-engine'});
  const pending = view.initialize({projectionEngine: a});
  await view.initialize({projectionEngine: b});
  complete(descriptor(2));
  await pending;
  expect(view.makeViewport(dimensions)!.crs.converter.WGS84.from([3, 0])).toEqual([12, 0, 0]);
});

test('late source failures from a replaced engine do not affect the new layer conversion', async () => {
  let reject!: (error: Error) => void;
  const a = engine(
    () =>
      new Promise((_resolve, rejectPromise) => {
        reject = rejectPromise;
      })
  );
  const b = engine(async () => descriptor(4));
  const errors = vi.fn();
  const manager = new LayerManager(device, {
    viewport: new WebMercatorViewport({width: 400, height: 300}),
    projectionEngine: a
  });
  manager.setProps({onError: errors});
  const layer = new PositionLayer({
    id: 'pending-source',
    data: [[8, 3, 0]],
    coordinateSystem: 'pending-engine-source'
  });
  try {
    manager.setLayers([layer]);
    expect(layer.internalState).toBeNull();
    manager.setProps({projectionEngine: b});
    manager.updateLayers();
    await flush();
    manager.updateLayers();
    reject(new Error('obsolete source failed'));
    await flush();
    manager.updateLayers();
    expect(layer.isLoaded).toBe(true);
    expect(
      Array.from(layer.getAttributeManager()!.getAttributes().positions.value!.slice(0, 3))
    ).toEqual([2, 3, 0]);
    expect(errors).not.toHaveBeenCalled();
  } finally {
    manager.finalize();
  }
});
