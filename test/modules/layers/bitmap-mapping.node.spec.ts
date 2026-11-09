// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {Field, FixedSizeList, Float64, Uint32, makeVector, vectorFromArray} from 'apache-arrow';
import {createMappedBitmapMesh} from '../../../modules/layers/src/bitmap-layer/bitmap-layer-mapping';

const geographic = '+proj=longlat +datum=WGS84';
const mercator = '+proj=merc +a=6378137 +b=6378137 +units=m';
const mapping = {
  bounds: [0, 0, 1, 1] as [number, number, number, number],
  positionCRS: geographic,
  imageCRS: geographic
};
const bounds = [0, 0, 1, 1] as [number, number, number, number];
const column = (rows: number[][]) =>
  vectorFromArray(
    rows,
    new FixedSizeList(rows[0].length, new Field('value', new Float64(), false))
  );
const values = source => Array.from(makeVector(source.data), row => Array.from(row));

test('Bitmap mapping generates correctly oriented UVs for the default footprint', () => {
  const result = createMappedBitmapMesh({bounds, imageMapping: mapping});
  expect(values(result.texCoords)).toEqual([
    [0, 1],
    [0, 0],
    [1, 0],
    [1, 1]
  ]);
  expect(Array.from(makeVector(result.indices!.data))).toEqual([0, 2, 1, 0, 3, 2]);
});

test('Bitmap mapping preserves manual segmentation and non-indexed topology', () => {
  const positions = column([
    [0, 0, 2],
    [1, 0, 2],
    [0, 1, 2]
  ]);
  const indices = vectorFromArray([2, 1, 0], new Uint32());
  const result = createMappedBitmapMesh({bounds, positions, indices, imageMapping: mapping});
  expect(values(result.positions)).toEqual([
    [0, 0, 2],
    [1, 0, 2],
    [0, 1, 2]
  ]);
  expect(Array.from(makeVector(result.indices!.data))).toEqual([2, 1, 0]);
  expect(createMappedBitmapMesh({bounds, positions, imageMapping: mapping}).indices).toBeNull();
});

test('Bitmap mapping uses the explicit image CRS for Mercator and equal-area imagery', () => {
  for (const imageCRS of [mercator, '+proj=cea +lat_ts=0 +datum=WGS84 +units=m']) {
    const result = createMappedBitmapMesh({
      bounds,
      positions: column([
        [0, 0],
        [1, 0],
        [0, 1]
      ]),
      imageMapping: {
        bounds: [0, 0, 111319.49079327357, 111319.49079327357],
        positionCRS: geographic,
        imageCRS
      }
    });
    const uvs = values(result.texCoords) as number[][];
    expect(uvs[0]).toEqual([0, 1]);
    expect(uvs[1][0]).toBeCloseTo(1, 5);
    expect(uvs[2][1]).toBeLessThan(0.01);
    expect(uvs[2][1]).toBeGreaterThan(-0.01);
  }
});

test('Bitmap explicit subdivision refines triangles and preserves duplicated seams', () => {
  const result = createMappedBitmapMesh({bounds, imageMapping: mapping, meshMaxEdgeLength: 0.6});
  const points = values(result.positions) as number[][];
  const indices = Array.from(makeVector(result.indices!.data)) as number[];
  expect(points.length).toBeGreaterThan(4);
  for (let i = 0; i < indices.length; i += 3) {
    const [a, b, c] = indices.slice(i, i + 3).map(index => points[index]);
    expect((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])).toBeGreaterThan(0);
    for (const [p, q] of [
      [a, b],
      [b, c],
      [c, a]
    ])
      expect(Math.hypot(p[0] - q[0], p[1] - q[1])).toBeLessThanOrEqual(0.6);
  }
  const seam = createMappedBitmapMesh({
    bounds,
    imageMapping: mapping,
    meshMaxEdgeLength: 0.6,
    positions: column([
      [0, 0],
      [1, 0],
      [0, 1],
      [0, 0],
      [1, 0],
      [0, 1]
    ])
  });
  expect(
    (values(seam.positions) as number[][]).filter(point => point[0] === 0 && point[1] === 0)
  ).toHaveLength(2);
});

test('Bitmap mapping rejects invalid inputs and exhausted refinement limits', () => {
  for (const changes of [
    {texCoords: column([[0, 0]])},
    {meshMaxEdgeLength: 0},
    {meshMaxEdgeLength: Infinity},
    {meshMaxEdgeLength: 1e-20},
    {imageMapping: {...mapping, bounds: [0, 0, 0, 1]}},
    {
      positions: column([
        [0, NaN],
        [1, 0],
        [0, 1]
      ])
    },
    {
      positions: column([
        [0, 100],
        [1, 100],
        [0, 101]
      ]),
      imageMapping: {...mapping, imageCRS: mercator}
    }
  ])
    expect(() =>
      createMappedBitmapMesh({bounds, imageMapping: mapping, ...changes} as any)
    ).toThrow();
});

test('Bitmap mapping retains view subdivision for bounds footprints', () => {
  const mesh = createMappedBitmapMesh({bounds, imageMapping: mapping}, 0.25);
  expect(mesh.positions!.length).toBeGreaterThan(4);
  const uv = values(mesh.texCoords) as number[][];
  expect(uv.every(([u, v]) => u >= 0 && u <= 1 && v >= 0 && v <= 1)).toBe(true);
});
