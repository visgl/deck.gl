// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {Field, FixedSizeList, Float32, Float64, Int32, Utf8} from 'apache-arrow';
import {getArrowConversionFormat} from '../../../../modules/core/src/arrow/upstream-luma/arrow-schema';

const list = (size: number, type = new Float32()) =>
  new FixedSizeList(size, new Field('values', type, true));

test('Arrow schema accepts numeric scalars, positions, colors and vectors', () => {
  for (const type of [new Int32(), new Float32(), new Float64()]) {
    expect(getArrowConversionFormat(type, {semantic: 'scalar'})).toBe('float32');
  }
  expect(getArrowConversionFormat(list(2), {semantic: 'position'})).toBe('float32x2');
  expect(getArrowConversionFormat(list(3), {semantic: 'position', format: 'float32x3'})).toBe(
    'float32x3'
  );
  for (const size of [3, 4]) {
    expect(getArrowConversionFormat(list(size), {semantic: 'color'})).toBe('unorm8x4');
    expect(getArrowConversionFormat(list(size), {format: 'unorm8x4'})).toBe('unorm8x4');
  }
  expect(getArrowConversionFormat(list(4), {semantic: 'numeric'})).toBe('float32x4');
});

test('Arrow schema rejects incompatible shapes and child types', () => {
  expect(() => getArrowConversionFormat(list(4), {semantic: 'position'})).toThrow(
    'Arrow positions'
  );
  expect(() => getArrowConversionFormat(list(2), {semantic: 'scalar'})).toThrow('must be numeric');
  expect(() => getArrowConversionFormat(list(2), {semantic: 'color'})).toThrow('width');
  expect(() => getArrowConversionFormat(new Utf8())).toThrow('numeric values');
  const strings = new FixedSizeList(3, new Field('values', new Utf8(), true));
  expect(() => getArrowConversionFormat(strings, {semantic: 'position'})).toThrow('numeric values');
  expect(() => getArrowConversionFormat(list(4), {format: 'float32x2'})).toThrow('width');
});

test('Arrow schema preserves padding and transform width rules', () => {
  expect(getArrowConversionFormat(list(2), {format: 'float32x3'})).toBe('float32x3');
  expect(
    getArrowConversionFormat(list(3), {format: 'float32x2', transform: value => value.slice(0, 2)})
  ).toBe('float32x2');
});
