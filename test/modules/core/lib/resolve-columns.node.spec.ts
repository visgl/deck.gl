// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {ScatterplotLayer} from '@deck.gl/layers';
import {resolveColumns} from '../../../../modules/core/src/lib/resolve-columns';
import {Float32, Table, vectorFromArray} from 'apache-arrow';

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

test('Table lookup selects compatible fields after explicit inputs', () => {
  const radii = vectorFromArray([1, 2], new Float32());
  const widths = vectorFromArray([3, 4], new Float32());
  const data = new Table({radii, widths, invalid: vectorFromArray(['a', 'b']), internal: radii});
  const definitions = {
    radii: {semantic: 'scalar'},
    widths: {semantic: 'scalar'},
    invalid: {semantic: 'scalar'},
    internal: {semantic: 'scalar', prop: false},
    missing: {semantic: 'scalar'}
  } as const;
  expect(resolveColumns({data}, definitions)).toEqual({});
  const result = resolveColumns({data, widths: radii, radii: null}, definitions, true);
  expect(Object.keys(result)).toEqual(['radii', 'widths']);
  expect(result.radii.data[0]).toBe(radii.data[0]);
  expect(result.widths).toBe(radii);
});
