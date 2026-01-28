// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import {equals} from '@math.gl/core';

import ColumnGeometry from '@deck.gl/layers/column-layer/column-geometry';

const TEST_VERTICES = [
  [-1, -1, 0],
  [-1, 1, 0],
  [1, 1, 0],
  [1, -1, 0]
];

test('ColumnGeometry#constructor', () => {
  let geometry = new ColumnGeometry({radius: 1, height: 1, nradial: 6});
  let attributes = geometry.getAttributes();

  expect(ArrayBuffer.isView(attributes.indices.value), 'indices generated').toBeTruthy();
  expect(ArrayBuffer.isView(attributes.POSITION.value), 'positions generated').toBeTruthy();
  expect(ArrayBuffer.isView(attributes.NORMAL.value), 'normals generated').toBeTruthy();

  geometry = new ColumnGeometry({radius: 1, height: 1, nradial: 4, vertices: TEST_VERTICES});
  attributes = geometry.getAttributes();

  expect(ArrayBuffer.isView(attributes.indices.value), 'indices generated').toBeTruthy();
  expect(ArrayBuffer.isView(attributes.POSITION.value), 'positions generated').toBeTruthy();
  expect(ArrayBuffer.isView(attributes.NORMAL.value), 'normals generated').toBeTruthy();

  expect(
    () => new ColumnGeometry({radius: 1, height: 1, nradial: 6, vertices: TEST_VERTICES}),
    'throws if not enough vertices are provided'
  ).toThrow();
});

test('ColumnGeometry#tesselation', () => {
  console.log('Regular geometry with height');
  let geometry = new ColumnGeometry({radius: 1, height: 1, nradial: 4});
  let attributes = geometry.getAttributes();

  expect(attributes.POSITION.value.length, 'POSITION has correct size').toBe((5 * 3 + 1) * 3);
  expect(attributes.NORMAL.value.length, 'NORMAL has correct size').toBe((5 * 3 + 1) * 3);
  expect(attributes.indices.value.length, 'indices has correct size').toBe(4 * 3 * 2);

  // prettier-ignore
  expect(equals(attributes.POSITION.value.slice(0, 3 * 8), [
    1, 0, 0.5, 1, 0, -0.5, 0, 1, 0.5, 0, 1, -0.5,
    -1, 0, 0.5, -1, 0, -0.5, 0, -1, 0.5, 0, -1, -0.5
  ]), 'positions generated').toBeTruthy();

  // prettier-ignore
  expect(equals(attributes.NORMAL.value.slice(0, 3 * 8), [
    1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0,
    -1, 0, 0, -1, 0, 0, 0, -1, 0, 0, -1, 0
  ]), 'normals generated').toBeTruthy();

  console.log('Custom geometry with height');
  geometry = new ColumnGeometry({radius: 1, height: 1, nradial: 4, vertices: TEST_VERTICES});
  attributes = geometry.getAttributes();

  // prettier-ignore
  expect(equals(attributes.POSITION.value.slice(0, 3 * 8), [
    1, -1, 0.5, 1, -1, -0.5,
    1, 1, 0.5, 1, 1, -0.5,
    -1, 1, 0.5, -1, 1, -0.5,
    -1, -1, 0.5, -1, -1, -0.5
  ]), 'positions generated').toBeTruthy();

  // prettier-ignore
  expect(equals(attributes.NORMAL.value.slice(0, 3 * 8), [
    1, -1, 0, 1, -1, -0,
    1, 1, 0, 1, 1, -0,
    -1, 1, 0, -1, 1, -0,
    -1, -1, 0, -1, -1, -0
  ]), 'normals generated').toBeTruthy();

  console.log('Regular geometry without height');
  geometry = new ColumnGeometry({radius: 1, height: 0, nradial: 4});
  attributes = geometry.getAttributes();

  expect(attributes.POSITION.value.length, 'POSITION has correct size').toBe(4 * 3);
  expect(attributes.NORMAL.value.length, 'NORMAL has correct size').toBe(4 * 3);
  expect(attributes.indices.value.length, 'indices has correct size').toBe(0);

  // prettier-ignore
  expect(equals(attributes.POSITION.value, [
    1, 0, 0,
    0, 1, 0,
    0, -1, 0,
    -1, 0, 0
  ]), 'positions generated').toBeTruthy();
});
