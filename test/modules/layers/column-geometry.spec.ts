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

test('ColumnGeometry#bevel', t => {
  const nradial = 4;
  const vertsAroundEdge = nradial + 1;

  t.comment('Flat bevel (bevelSegments=0)');
  let geometry = new ColumnGeometry({radius: 1, height: 1, nradial, bevelSegments: 0});
  let attributes = geometry.getAttributes();

  t.ok(ArrayBuffer.isView(attributes.POSITION.value), 'flat bevel positions generated');
  t.ok(ArrayBuffer.isView(attributes.NORMAL.value), 'flat bevel normals generated');
  // Flat cap: sides (vertsAroundEdge * 2) + degenerate (1) + top cap (vertsAroundEdge)
  t.is(
    attributes.POSITION.value.length,
    (vertsAroundEdge * 3 + 1) * 3,
    'flat bevel POSITION has correct size'
  );

  t.comment('Cone bevel (bevelSegments=2)');
  geometry = new ColumnGeometry({
    radius: 1,
    height: 1,
    nradial,
    bevelSegments: 2,
    bevelHeight: 1,
    smoothNormals: false
  });
  attributes = geometry.getAttributes();

  t.ok(ArrayBuffer.isView(attributes.POSITION.value), 'cone bevel positions generated');
  t.ok(ArrayBuffer.isView(attributes.NORMAL.value), 'cone bevel normals generated');
  t.ok(attributes.POSITION.value.length > 0, 'cone bevel has vertices');

  // Check that apex is at center (x=0, y=0) and cuts into column (z < 0.5)
  const conePositions = attributes.POSITION.value;
  const coneApexZ = conePositions[conePositions.length - 1];
  t.ok(coneApexZ < 0.5, 'cone apex cuts INTO column (z < top edge)');
  t.is(conePositions[conePositions.length - 3], 0, 'cone apex at x=0');
  t.is(conePositions[conePositions.length - 2], 0, 'cone apex at y=0');

  t.comment('Dome bevel (bevelSegments=5, smoothNormals=true)');
  geometry = new ColumnGeometry({
    radius: 1,
    height: 1,
    nradial,
    bevelSegments: 5,
    bevelHeight: 1,
    smoothNormals: true
  });
  attributes = geometry.getAttributes();

  t.ok(ArrayBuffer.isView(attributes.POSITION.value), 'dome bevel positions generated');
  t.ok(ArrayBuffer.isView(attributes.NORMAL.value), 'dome bevel normals generated');
  t.ok(
    attributes.POSITION.value.length > (vertsAroundEdge * 3 + 1) * 3,
    'dome bevel has more vertices than flat'
  );

  // Verify apex cuts into column
  const domePositions = attributes.POSITION.value;
  const domeApexZ = domePositions[domePositions.length - 1];
  t.ok(domeApexZ < 0.5, 'dome apex cuts INTO column (z < top edge)');

  t.comment('Bevel with custom height');
  geometry = new ColumnGeometry({
    radius: 1,
    height: 1,
    nradial,
    bevelSegments: 2,
    bevelHeight: 0.5,
    smoothNormals: false
  });
  attributes = geometry.getAttributes();

  const shallowPositions = attributes.POSITION.value;
  const shallowApexZ = shallowPositions[shallowPositions.length - 1];
  // With bevelHeight=0.5, apex should be at 0.5 - 0.5*1 = 0 for height=1, radius=1
  t.ok(shallowApexZ > coneApexZ, 'shallow bevel has apex higher than full bevel');

  t.comment('Bevel with smoothNormals=false (planar normals)');
  geometry = new ColumnGeometry({
    radius: 1,
    height: 1,
    nradial,
    bevelSegments: 3,
    bevelHeight: 1,
    smoothNormals: false
  });
  attributes = geometry.getAttributes();

  t.ok(ArrayBuffer.isView(attributes.NORMAL.value), 'planar normals generated');
  // Planar normals should have consistent z-component across a face
  const planarNormals = attributes.NORMAL.value;
  t.ok(planarNormals.length > 0, 'planar normals have values');

  t.end();
});
