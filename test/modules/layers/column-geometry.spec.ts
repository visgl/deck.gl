// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {equals} from '@math.gl/core';

import ColumnGeometry from '@deck.gl/layers/column-layer/column-geometry';

const TEST_VERTICES = [
  [-1, -1, 0],
  [-1, 1, 0],
  [1, 1, 0],
  [1, -1, 0]
];

test('ColumnGeometry#constructor', t => {
  let geometry = new ColumnGeometry({radius: 1, height: 1, nradial: 6});
  let attributes = geometry.getAttributes();

  t.ok(ArrayBuffer.isView(attributes.indices.value), 'indices generated');
  t.ok(ArrayBuffer.isView(attributes.POSITION.value), 'positions generated');
  t.ok(ArrayBuffer.isView(attributes.NORMAL.value), 'normals generated');

  geometry = new ColumnGeometry({radius: 1, height: 1, nradial: 4, vertices: TEST_VERTICES});
  attributes = geometry.getAttributes();

  t.ok(ArrayBuffer.isView(attributes.indices.value), 'indices generated');
  t.ok(ArrayBuffer.isView(attributes.POSITION.value), 'positions generated');
  t.ok(ArrayBuffer.isView(attributes.NORMAL.value), 'normals generated');

  t.throws(
    () => new ColumnGeometry({radius: 1, height: 1, nradial: 6, vertices: TEST_VERTICES}),
    'throws if not enough vertices are provided'
  );

  t.end();
});

test('ColumnGeometry#tesselation', t => {
  t.comment('Regular geometry with height');
  let geometry = new ColumnGeometry({radius: 1, height: 1, nradial: 4});
  let attributes = geometry.getAttributes();

  t.is(attributes.POSITION.value.length, (5 * 3 + 1) * 3, 'POSITION has correct size');
  t.is(attributes.NORMAL.value.length, (5 * 3 + 1) * 3, 'NORMAL has correct size');
  t.is(attributes.indices.value.length, 4 * 3 * 2, 'indices has correct size');

  // prettier-ignore
  t.ok(equals(attributes.POSITION.value.slice(0, 3 * 8), [
    1, 0, 0.5, 1, 0, -0.5, 0, 1, 0.5, 0, 1, -0.5,
    -1, 0, 0.5, -1, 0, -0.5, 0, -1, 0.5, 0, -1, -0.5
  ]), 'positions generated');

  // prettier-ignore
  t.ok(equals(attributes.NORMAL.value.slice(0, 3 * 8), [
    1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0,
    -1, 0, 0, -1, 0, 0, 0, -1, 0, 0, -1, 0
  ]), 'normals generated');

  t.comment('Custom geometry with height');
  geometry = new ColumnGeometry({radius: 1, height: 1, nradial: 4, vertices: TEST_VERTICES});
  attributes = geometry.getAttributes();

  // prettier-ignore
  t.ok(equals(attributes.POSITION.value.slice(0, 3 * 8), [
    1, -1, 0.5, 1, -1, -0.5,
    1, 1, 0.5, 1, 1, -0.5,
    -1, 1, 0.5, -1, 1, -0.5,
    -1, -1, 0.5, -1, -1, -0.5
  ]), 'positions generated');

  // prettier-ignore
  t.ok(equals(attributes.NORMAL.value.slice(0, 3 * 8), [
    1, -1, 0, 1, -1, -0,
    1, 1, 0, 1, 1, -0,
    -1, 1, 0, -1, 1, -0,
    -1, -1, 0, -1, -1, -0
  ]), 'normals generated');

  t.comment('Regular geometry without height');
  geometry = new ColumnGeometry({radius: 1, height: 0, nradial: 4});
  attributes = geometry.getAttributes();

  t.is(attributes.POSITION.value.length, 4 * 3, 'POSITION has correct size');
  t.is(attributes.NORMAL.value.length, 4 * 3, 'NORMAL has correct size');
  t.is(attributes.indices.value.length, 0, 'indices has correct size');

  // prettier-ignore
  t.ok(equals(attributes.POSITION.value, [
    1, 0, 0,
    0, 1, 0,
    0, -1, 0,
    -1, 0, 0
  ]), 'positions generated');

  t.end();
});

test('ColumnGeometry#cap', t => {
  const nradial = 4;
  const vertsAroundEdge = nradial + 1;

  t.comment('cone cap');
  // capSegs = 1 for cone
  const capSegs_cone = 1;
  const expectedConeVerts = vertsAroundEdge * 2 * (1 + capSegs_cone) + capSegs_cone + 1;
  let geometry = new ColumnGeometry({radius: 1, height: 1, nradial, cap: 'cone'});
  let attributes = geometry.getAttributes();

  t.is(
    attributes.POSITION.value.length,
    expectedConeVerts * 3,
    'cone cap POSITION has correct size'
  );
  t.is(
    attributes.NORMAL.value.length,
    expectedConeVerts * 3,
    'cone cap NORMAL has correct size'
  );
  // wireframe indices unchanged (covers sides only)
  t.is(attributes.indices.value.length, nradial * 3 * 2, 'cone cap indices has correct size');

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
  t.ok(foundApex, 'cone cap has apex vertex at (0, 0, height/2 + radius)');

  t.comment('dome cap');
  // capSegs = max(2, round(nradial/4)) for dome; nradial=4 → max(2,1) = 2
  const capSegs_dome = Math.max(2, Math.round(nradial / 4));
  const expectedDomeVerts = vertsAroundEdge * 2 * (1 + capSegs_dome) + capSegs_dome + 1;
  geometry = new ColumnGeometry({radius: 1, height: 1, nradial, cap: 'dome'});
  attributes = geometry.getAttributes();

  t.is(
    attributes.POSITION.value.length,
    expectedDomeVerts * 3,
    'dome cap POSITION has correct size'
  );

  // Verify side geometry is preserved (first 8 side vertices unchanged from flat)
  const flatGeometry = new ColumnGeometry({radius: 1, height: 1, nradial});
  const flatAttributes = flatGeometry.getAttributes();
  t.ok(
    equals(
      attributes.POSITION.value.slice(0, 3 * 8),
      flatAttributes.POSITION.value.slice(0, 3 * 8)
    ),
    'dome cap: side positions match flat'
  );

  t.comment('cap prop ignored when not extruded');
  geometry = new ColumnGeometry({radius: 1, height: 0, nradial, cap: 'dome'});
  attributes = geometry.getAttributes();
  t.is(
    attributes.POSITION.value.length,
    nradial * 3,
    'cap ignored when height=0 (not extruded)'
  );

  t.end();
});
