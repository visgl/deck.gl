// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
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

test('ColumnGeometry#cap', () => {
  const nradial = 4;
  const vertsAroundEdge = nradial + 1;

  // capSegs = 1 for cone
  const capSegsCone = 1;
  const expectedConeVerts = vertsAroundEdge * 2 * (1 + capSegsCone) + capSegsCone + 1;
  let geometry = new ColumnGeometry({radius: 1, height: 1, nradial, cap: 'cone'});
  let attributes = geometry.getAttributes();

  expect(attributes.POSITION.value.length, 'cone cap POSITION has correct size').toBe(
    expectedConeVerts * 3
  );
  expect(attributes.NORMAL.value.length, 'cone cap NORMAL has correct size').toBe(
    expectedConeVerts * 3
  );
  // wireframe indices unchanged (covers sides only)
  expect(attributes.indices.value.length, 'cone cap indices has correct size').toBe(
    nradial * 3 * 2
  );

  // Verify apex vertices (ring_1 = theta=PI/2) have z = height/2 + radius = 1/2 + 1 = 1.5
  // and position (0, 0, 1.5) (radius * cos(PI/2) = 0)
  const apexZ = 1 / 2 + 1; // 1.5
  let foundApex = false;
  for (let n = 0; n < expectedConeVerts; n++) {
    const x = attributes.POSITION.value[n * 3];
    const y = attributes.POSITION.value[n * 3 + 1];
    const z = attributes.POSITION.value[n * 3 + 2];
    if (Math.abs(x) < 1e-6 && Math.abs(y) < 1e-6 && Math.abs(z - apexZ) < 1e-6) {
      foundApex = true;
    }
  }
  expect(foundApex, 'cone cap has apex vertex at (0, 0, height/2 + radius)').toBeTruthy();

  // capSegs = max(2, round(nradial/4)) for dome; nradial=4 → max(2,1) = 2
  const capSegsDome = Math.max(2, Math.round(nradial / 4));
  const expectedDomeVerts = vertsAroundEdge * 2 * (1 + capSegsDome) + capSegsDome + 1;
  geometry = new ColumnGeometry({radius: 1, height: 1, nradial, cap: 'dome'});
  attributes = geometry.getAttributes();

  expect(attributes.POSITION.value.length, 'dome cap POSITION has correct size').toBe(
    expectedDomeVerts * 3
  );

  // Verify side geometry is preserved (first 8 side vertices unchanged from flat)
  const flatGeometry = new ColumnGeometry({radius: 1, height: 1, nradial});
  const flatAttributes = flatGeometry.getAttributes();
  expect(
    equals(
      attributes.POSITION.value.slice(0, 3 * 8),
      flatAttributes.POSITION.value.slice(0, 3 * 8)
    ),
    'dome cap: side positions match flat'
  ).toBeTruthy();

  geometry = new ColumnGeometry({radius: 1, height: 0, nradial, cap: 'dome'});
  attributes = geometry.getAttributes();
  expect(attributes.POSITION.value.length, 'cap ignored when height=0 (not extruded)').toBe(
    nradial * 3
  );
});
