// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {projectionEngine} from '@math.gl/projection';
import type {CRSDescriptor} from '@math.gl/projection/core';
import {resolveCRS, WGS84_CRS} from '@deck.gl/core/utils/crs';
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
