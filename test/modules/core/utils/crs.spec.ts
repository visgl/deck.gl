// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import ViewManager from '@deck.gl/core/lib/view-manager';
import {_CustomProjectionView as CustomProjectionView} from '@deck.gl/core';
import {projectionEngine} from '@math.gl/projection';
import type {CRSDescriptor} from '@math.gl/projection/core';
import {areCRSEqual, resolveCRS, WGS84_CRS} from '@deck.gl/core/utils/crs';
import {GLOBE_CRS} from '@deck.gl/core/viewports/globe-util';
import {createTestCRS} from '../viewports/test-crs';

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

test('CRS resolver shares aliases, pending requests and loaded descriptors', async () => {
  for (const alias of ['lnglat', 'WGS84', 'wgs84', 'EPSG:4326', 'EPSG:4979']) {
    expect(resolveCRS(alias)).toBe(WGS84_CRS);
  }
  expect(resolveCRS('globe')).toBe(GLOBE_CRS);
  for (const name of ['cartesian', 'meter-offsets']) expect(resolveCRS(name)).toBeNull();
  const request = deferredCRS();
  const getCRS = vi.spyOn(projectionEngine, 'getCRS').mockReturnValue(request.promise);
  try {
    const first = resolveCRS('test:resolver');
    expect(first).toBeInstanceOf(Promise);
    expect(resolveCRS('test:resolver')).toBe(first);
    expect(getCRS).toHaveBeenCalledTimes(1);
    request.resolve(source);
    await first;
    expect(resolveCRS('test:resolver')).toBe(source);
    expect(resolveCRS(source.signature)).toBe(source);
  } finally {
    getCRS.mockRestore();
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

const projectedCRS = {
  type: 'ProjectedCRS',
  name: 'Test transverse Mercator',
  base_crs: geographicCRS,
  conversion: {name: 'Test conversion', method: {name: 'Transverse Mercator'}, parameters: []},
  coordinate_system: {
    subtype: 'Cartesian',
    axis: [
      {name: 'Easting', abbreviation: 'E', direction: 'east', unit: 'metre'},
      {name: 'Northing', abbreviation: 'N', direction: 'north', unit: 'metre'}
    ]
  }
} as const;

test('CRS resolver accepts WKT, PROJJSON, CRS references and spatial references', async () => {
  const reference = {
    state: 'explicit',
    definition: projectedCRS,
    representation: 'projjson',
    provenance: 'metadata'
  } as const;
  const definitions = [
    'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]]',
    geographicCRS,
    projectedCRS,
    reference,
    {crs: reference, coordinateFrame: 'projected', coordinateOrder: ['x', 'y']} as const
  ];
  for (const definition of definitions) {
    const pending = resolveCRS(definition);
    expect(resolveCRS(structuredClone(definition))).toBe(pending);
    const crs = (await pending)!;
    expect(resolveCRS(structuredClone(definition))).toBe(crs);
    const coordinate = [1, 1, 4];
    const projected = crs.converter.WGS84.from(coordinate);
    crs.converter.WGS84.to(projected).forEach((value, axis) => {
      expect(value).toBeCloseTo(coordinate[axis], 6);
    });
  }
});

test('CustomProjectionView resolves a PROJJSON definition', async () => {
  const view = new CustomProjectionView({crs: projectedCRS});
  await view.initialize();
  const viewport = view.makeViewport({
    width: 400,
    height: 300,
    viewState: {center: [0, 0, 0], zoom: 0}
  })!;
  expect(viewport.crs.projection).toBe('tmerc');
  expect(viewport.projectPosition([0, 0, 0])).toEqual([0, 0, 0]);
});

test('failed CRS loads allow a fresh view to retry', async () => {
  const definition = 'test:retry-after-failure';
  const request = deferredCRS();
  const getCRS = vi
    .spyOn(projectionEngine, 'getCRS')
    .mockReturnValueOnce(request.promise)
    .mockResolvedValueOnce(source);
  try {
    const failedView = new CustomProjectionView({crs: definition});
    const failed = failedView.initialize();
    const shared = resolveCRS(definition);
    expect(getCRS).toHaveBeenCalledTimes(1);
    const error = new Error('Temporary module load failure');
    const assertions = Promise.all([
      expect(failed).rejects.toBe(error),
      expect(shared).rejects.toBe(error)
    ]);
    request.reject(error);
    await assertions;
    const retry = new CustomProjectionView({crs: definition});
    await retry.initialize();
    expect(getCRS).toHaveBeenCalledTimes(2);
    expect(resolveCRS(definition)).toBe(source);
    expect(
      retry.makeViewport({width: 400, height: 300, viewState: {center: [0, 0, 0], zoom: 0}})
    ).not.toBeNull();
  } finally {
    getCRS.mockRestore();
  }
});

test('failed CRS loads do not evict a descriptor registered by signature', async () => {
  const definition = 'test:pending-signature';
  const request = deferredCRS();
  const descriptor = {...source, signature: definition};
  const getCRS = vi
    .spyOn(projectionEngine, 'getCRS')
    .mockReturnValueOnce(request.promise)
    .mockResolvedValueOnce(descriptor);
  try {
    const pending = resolveCRS(definition);
    await resolveCRS('test:other-definition');
    const failure = expect(pending).rejects.toThrow('load failure');
    request.reject(new Error('load failure'));
    await failure;
    expect(resolveCRS(definition)).toBe(descriptor);
  } finally {
    getCRS.mockRestore();
  }
});

test('structured CRS equality retains viewports and detects nested changes', async () => {
  const reference = {
    crs: {
      state: 'explicit',
      definition: projectedCRS,
      representation: 'projjson',
      provenance: 'metadata'
    },
    coordinateFrame: 'projected',
    coordinateOrder: ['x', 'y']
  } as const;
  for (const crs of [projectedCRS, reference]) {
    const view = new CustomProjectionView({crs, controller: {keyboard: false}});
    const copy = new CustomProjectionView({
      crs: structuredClone(crs),
      controller: {keyboard: false}
    });
    expect(view.equals(copy)).toBe(true);
    expect(view.equals(copy.clone({controller: {keyboard: true}}))).toBe(false);
    expect(view.equals(copy.clone({width: 100}))).toBe(false);
    const changed = structuredClone(crs);
    const definition = 'crs' in changed ? changed.crs.definition : changed;
    Object.assign(definition.base_crs.datum.ellipsoid, {semi_major_axis: 6378000});
    expect(view.equals(copy.clone({crs: changed}))).toBe(false);
    await view.initialize();
    const manager = new ViewManager({
      views: [view],
      width: 400,
      height: 300,
      viewState: {center: [0, 0, 0], zoom: 0}
    });
    try {
      const viewport = manager.getViewports()[0];
      manager.setProps({views: [copy]});
      expect(manager.updateViewports()).toBe(false);
      expect(manager.getViewports()[0]).toBe(viewport);
    } finally {
      manager.finalize();
    }
  }
});

test('ViewManager retries failed structured CRS with an equivalent new view', async () => {
  const definition = {...projectedCRS, name: 'Retry through ViewManager'};
  const request = deferredCRS();
  const getCRS = vi
    .spyOn(projectionEngine, 'getCRS')
    .mockReturnValueOnce(request.promise)
    .mockResolvedValueOnce(source);
  const onError = vi.fn();
  const view = new CustomProjectionView({crs: definition});
  const manager = new ViewManager({
    views: [view],
    onError,
    width: 400,
    height: 300,
    viewState: {center: [0, 0, 0], zoom: 0}
  });
  try {
    manager.setProps({views: [view.clone({crs: structuredClone(definition)})]});
    expect(manager.views[0]).toBe(view);
    expect(getCRS).toHaveBeenCalledTimes(1);
    const error = new Error('Temporary module load failure');
    request.reject(error);
    await vi.waitFor(() => expect(onError).toHaveBeenCalledWith(error));
    expect(manager.getViewports()).toHaveLength(0);
    const replacement = view.clone({crs: structuredClone(definition)});
    manager.setProps({views: [replacement]});
    expect(manager.views[0]).toBe(replacement);
    expect(getCRS).toHaveBeenCalledTimes(2);
    await replacement.initialize();
    manager.updateViewports();
    expect(manager.getViewports()).toHaveLength(1);
    const viewport = manager.getViewports()[0];
    manager.setProps({views: [replacement.clone({crs: structuredClone(definition)})]});
    expect(manager.views[0]).toBe(replacement);
    expect(manager.getViewports()[0]).toBe(viewport);
    expect(getCRS).toHaveBeenCalledTimes(2);
    expect(onError).toHaveBeenCalledTimes(1);
  } finally {
    manager.finalize();
    getCRS.mockRestore();
  }
});

test('CRS equality compares definitions without resolving them', () => {
  expect(areCRSEqual('EPSG:4326', 'EPSG:4326')).toBe(true);
  expect(areCRSEqual('EPSG:4326', 'WGS84')).toBe(false);
  expect(areCRSEqual(projectedCRS, structuredClone(projectedCRS))).toBe(true);
  expect(areCRSEqual(projectedCRS, {...projectedCRS, name: 'Other CRS'})).toBe(false);
  expect(areCRSEqual(projectedCRS, JSON.stringify(projectedCRS))).toBe(true);
  const stringify = vi.spyOn(JSON, 'stringify');
  try {
    expect(areCRSEqual(projectedCRS, projectedCRS)).toBe(true);
    expect(stringify).not.toHaveBeenCalled();
  } finally {
    stringify.mockRestore();
  }
});
