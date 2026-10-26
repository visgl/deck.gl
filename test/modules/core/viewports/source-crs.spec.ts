// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {
  Viewport,
  WebMercatorViewport,
  FirstPersonViewport,
  _GlobeViewport as GlobeViewport
} from '@deck.gl/core';
import {WGS84_CRS} from '@deck.gl/core/utils/crs';
import {createTestCRS, createTestViewport} from './test-crs';

const source = createTestCRS({
  signature: 'source',
  converter: {
    forward: ([x, y, z = 0]) => [x * 2, y * 3, z * 4],
    inverse: ([x, y, z = 0]) => [x / 2, y / 3, z / 4]
  }
});

test('Viewport projects a declared source CRS independently of attribute packing', () => {
  for (const viewport of [
    new WebMercatorViewport(),
    new GlobeViewport(),
    new FirstPersonViewport({longitude: 10, latitude: 20}),
    new Viewport({crs: source}),
    createTestViewport()
  ]) {
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
