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

test('ColumnGeometry#capShape', t => {
  const nradial = 4;
  const vertsAroundEdge = nradial + 1;
  
  t.comment('Flat cap shape');
  let geometry = new ColumnGeometry({radius: 1, height: 1, nradial, capShape: 'flat'});
  let attributes = geometry.getAttributes();

  t.ok(ArrayBuffer.isView(attributes.POSITION.value), 'flat cap positions generated');
  t.ok(ArrayBuffer.isView(attributes.NORMAL.value), 'flat cap normals generated');
  // Flat cap: sides (vertsAroundEdge * 2) + degenerate (1) + top cap (vertsAroundEdge)
  t.is(attributes.POSITION.value.length, (vertsAroundEdge * 3 + 1) * 3, 'flat cap POSITION has correct size');

  t.comment('Pointy cap shape');
  geometry = new ColumnGeometry({radius: 1, height: 1, nradial, capShape: 'pointy'});
  attributes = geometry.getAttributes();

  t.ok(ArrayBuffer.isView(attributes.POSITION.value), 'pointy cap positions generated');
  t.ok(ArrayBuffer.isView(attributes.NORMAL.value), 'pointy cap normals generated');
  t.ok(attributes.POSITION.value.length > 0, 'pointy cap has vertices');
  
  // Check that there's a point at the top center
  const positions = attributes.POSITION.value;
  const lastVertex = [positions[positions.length - 3], positions[positions.length - 2], positions[positions.length - 1]];
  t.ok(Math.abs(lastVertex[0]) < 0.01 && Math.abs(lastVertex[1]) < 0.01, 'pointy cap has center point');
  t.ok(lastVertex[2] > 0, 'pointy cap center point is at top');

  t.comment('Rounded cap shape');
  geometry = new ColumnGeometry({radius: 1, height: 1, nradial, capShape: 'rounded'});
  attributes = geometry.getAttributes();

  t.ok(ArrayBuffer.isView(attributes.POSITION.value), 'rounded cap positions generated');
  t.ok(ArrayBuffer.isView(attributes.NORMAL.value), 'rounded cap normals generated');
  t.ok(attributes.POSITION.value.length > (vertsAroundEdge * 3 + 1) * 3, 'rounded cap has more vertices than flat');

  t.end();
});
