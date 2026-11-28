// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {equals} from '@math.gl/core/matrix';

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

  expect(geometry.topology, 'wireframe topology').toBe('line-list');
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

  // biome-ignore format: preserve layout
  expect(equals(attributes.POSITION.value.slice(0, 3 * 8), [
    1, 0, 0.5, 1, 0, -0.5, 0, 1, 0.5, 0, 1, -0.5,
    -1, 0, 0.5, -1, 0, -0.5, 0, -1, 0.5, 0, -1, -0.5
  ]), 'positions generated').toBeTruthy();

  // biome-ignore format: preserve layout
  expect(equals(attributes.NORMAL.value.slice(0, 3 * 8), [
    1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0,
    -1, 0, 0, -1, 0, 0, 0, -1, 0, 0, -1, 0
  ]), 'normals generated').toBeTruthy();

  console.log('Custom geometry with height');
  geometry = new ColumnGeometry({radius: 1, height: 1, nradial: 4, vertices: TEST_VERTICES});
  attributes = geometry.getAttributes();

  // biome-ignore format: preserve layout
  expect(equals(attributes.POSITION.value.slice(0, 3 * 8), [
    1, -1, 0.5, 1, -1, -0.5,
    1, 1, 0.5, 1, 1, -0.5,
    -1, 1, 0.5, -1, 1, -0.5,
    -1, -1, 0.5, -1, -1, -0.5
  ]), 'positions generated').toBeTruthy();

  // biome-ignore format: preserve layout
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

  // biome-ignore format: preserve layout
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
  const expectedConeVerts = vertsAroundEdge * 2 * (1 + capSegsCone) + capSegsCone * 2;
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
  const expectedDomeVerts = vertsAroundEdge * 2 * (1 + capSegsDome) + capSegsDome * 2;
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

/** Returns the face normals of the non-degenerate triangles of a triangle strip. */
function getStripFaces(positions: ArrayLike<number>): {centroid: number[]; normal: number[]}[] {
  const vertex = (index: number) => [0, 1, 2].map(axis => positions[index * 3 + axis]);
  const faces: {centroid: number[]; normal: number[]}[] = [];
  for (let k = 0; k + 2 < positions.length / 3; k++) {
    // Odd triangles of a strip swap their first two vertices to keep the winding
    const [a, b, c] = (k % 2 ? [k + 1, k, k + 2] : [k, k + 1, k + 2]).map(vertex);
    const ab = [0, 1, 2].map(axis => b[axis] - a[axis]);
    const ac = [0, 1, 2].map(axis => c[axis] - a[axis]);
    const normal = [
      ab[1] * ac[2] - ab[2] * ac[1],
      ab[2] * ac[0] - ab[0] * ac[2],
      ab[0] * ac[1] - ab[1] * ac[0]
    ];
    if (Math.hypot(...normal) > 1e-9) {
      faces.push({centroid: [0, 1, 2].map(axis => (a[axis] + b[axis] + c[axis]) / 3), normal});
    }
  }
  return faces;
}

test('ColumnGeometry#cap winding faces outward', () => {
  for (const cap of ['flat', 'dome', 'cone'] as const) {
    for (const options of [{nradial: 4}, {nradial: 12}, {nradial: 4, vertices: TEST_VERTICES}]) {
      const geometry = new ColumnGeometry({radius: 1, height: 1, ...options, cap});
      const faces = getStripFaces(geometry.getAttributes().POSITION.value);
      // The column is convex around the origin, so outward faces point away from it
      const inward = faces.filter(
        ({centroid, normal}) =>
          centroid[0] * normal[0] + centroid[1] * normal[1] + centroid[2] * normal[2] <= 0
      );
      expect(inward, `${cap} cap ${JSON.stringify(options)} has no inward triangles`).toHaveLength(
        0
      );
    }
  }
});

test('ColumnGeometry#cone cap normals follow the slope', () => {
  const nradial = 4;
  const geometry = new ColumnGeometry({radius: 1, height: 1, nradial, cap: 'cone'});
  const {POSITION, NORMAL} = geometry.getAttributes();
  const capStart = (nradial + 1) * 2 + 2;
  for (let index = capStart; index < POSITION.value.length / 3; index++) {
    const normal = [0, 1, 2].map(axis => NORMAL.value[index * 3 + axis]);
    const z = POSITION.value[index * 3 + 2];
    // The cone rises 1 above the sides over a base radius of 1
    expect(normal[2], `normal ${index} is 45 degrees up the slope at z ${z}`).toBeCloseTo(
      Math.SQRT1_2
    );
    expect(Math.hypot(...normal), `normal ${index} has unit length`).toBeCloseTo(1);
  }
});
