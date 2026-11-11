// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {ScatterplotLayer} from '@deck.gl/layers';
import {resolveColumns} from '../../../../modules/core/src/lib/resolve-columns';
import {vectorFromArray} from 'apache-arrow';

test('Column selection borrows declared inputs and excludes internal fields', () => {
  const radii = vectorFromArray([1, 2]);
  const props = Object.freeze({radii, unused: radii, internal: radii, positions: null});
  expect(resolveColumns(props, {radii: {}, internal: {prop: false}, positions: {}})).toEqual({
    radii
  });
  expect(resolveColumns(props, {radii: {}}).radii).toBe(radii);
});

test('Layer exposes selection without requiring initialization', () => {
  class TestLayer extends ScatterplotLayer {
    select() {
      return this.resolveColumns({radii: {}, positions: {}});
    }
  }
  const radii = vectorFromArray([1, 2]);
  const layer = new TestLayer({id: 'columns', radii});
  expect(layer.select()).toEqual({radii});
  expect(new TestLayer({id: 'empty'}).select()).toEqual({});
});

test('Column selection leaves validation to preparation', () => {
  const invalid = 'invalid explicit column';
  expect(resolveColumns({positions: invalid}, {positions: {}})).toEqual({positions: invalid});
  expect(resolveColumns({positions: undefined}, {positions: {}})).toEqual({});
});
