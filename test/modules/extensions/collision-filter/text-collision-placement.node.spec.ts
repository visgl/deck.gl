// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {placeTextLabels} from '@deck.gl/extensions/collision-filter/text-collision-placement';

type Label = {
  corners: number[];
  priority?: number;
  /** Whether the GPU found the label visible */
  eligible?: boolean;
  pickingIndex?: number;
  /** Texels of the parts that were drawn, e.g. not hidden by ClipExtension. Defaults to all. */
  drawnTexels?: number[];
  /** Whether the placement data was written whole, partly (e.g. masked), or not at all */
  placementData?: 'whole' | 'partial' | 'none';
};
const WIDTH = 400;
const HEIGHT = 200;

function rectangle(x: number, y: number, width: number, height: number): number[] {
  return [x, y, x + width, y, x + width, y + height, x, y + height];
}

/**
 * Write labels into visibility and placement textures as the greedy GPU passes do, place them,
 * and return the visible label indices. Labels use the given visibility cells, or 1..n by
 * default, and their cell as picking color index unless given.
 */
function place(
  labels: Label[],
  {
    ids = labels.map((_, i) => i + 1),
    objectCount = labels.length,
    columns = Math.ceil(Math.sqrt(objectCount + 1))
  }: {ids?: number[]; objectCount?: number; columns?: number} = {}
): number[] {
  const width = columns * 4;
  const stride = width * 4;
  const size = Math.ceil((objectCount + 1) / columns) * 4 * stride;
  // Visibility cells start unoccluded and undrawn, placement cells empty
  const visibility = new Uint8Array(size).map((_, i) => (i % 4 === 3 ? 0 : 255));
  const placement = new Uint8Array(size);
  const getTexelOffset = (index: number, texel: number) =>
    Math.floor(index / columns) * 4 * stride +
    (index % columns) * 16 +
    Math.floor(texel / 4) * stride +
    (texel % 4) * 4;
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    for (const texel of label.drawnTexels ?? Array.from({length: 16}, (_, texel) => texel)) {
      visibility[getTexelOffset(ids[i], texel) + 3] = 255;
    }
    if (label.eligible === false) visibility[getTexelOffset(ids[i], 5)] = 0;

    const words = new DataView(new ArrayBuffer(40));
    label.corners.forEach((value, axis) => {
      words.setFloat32(axis * 4, value / (axis % 2 ? HEIGHT : WIDTH), true);
    });
    words.setFloat32(32, label.priority || 0, true);
    words.setUint32(36, label.pickingIndex ?? ids[i], true);
    const texelCount = {whole: 14, partial: 13, none: 0}[label.placementData ?? 'whole'];
    for (let texel = 0; texel < texelCount; texel++) {
      const offset = getTexelOffset(ids[i], texel);
      for (let byte = 0; byte < 3 && texel * 3 + byte < 40; byte++) {
        placement[offset + byte] = words.getUint8(texel * 3 + byte);
      }
      placement[offset + 3] = 255;
    }
  }
  const count = placeTextLabels(visibility, placement, width, objectCount, WIDTH, HEIGHT);
  const result = labels.flatMap((_, i) =>
    Array.from({length: 16}, (__, texel) => visibility[getTexelOffset(ids[i], texel)]).every(
      value => value === 255
    )
      ? [i]
      : []
  );
  expect(count).toBe(result.length);
  return result;
}

test('text placement releases space occupied by rejected candidates', () => {
  expect(
    place([0, 1, 2].map(index => ({corners: rectangle(index * 80, 0, 100, 30), priority: index})))
  ).toEqual([0, 2]);
});

test('text placement fills a dense grid with stable tie breaking', () => {
  const labels = Array.from({length: 200}, (_, index) => ({
    corners: rectangle((index % 20) * 12, Math.floor(index / 20) * 7, 35, 18)
  }));
  const expected: number[] = [];
  for (let row = 9; row >= 0; row -= 3) {
    for (let column = 19; column >= 0; column -= 3) expected.push(row * 20 + column);
  }
  expect(place(labels)).toEqual(expected.sort((a, b) => a - b));
});

test('text placement compares polygons when rotated bounds overlap', () => {
  expect(
    place([
      {corners: [10, 20, 20, 10, 30, 20, 20, 30]},
      {corners: [25, 35, 35, 25, 45, 35, 35, 45]}
    ])
  ).toEqual([0, 1]);
});

test('text placement respects fractional priorities and contained labels', () => {
  expect(
    place([
      {corners: rectangle(0, 0, 100, 100), priority: 20},
      {corners: rectangle(20, 20, 10, 10), priority: 20.001}
    ])
  ).toEqual([1]);
});

test('text placement excludes offscreen, empty and ineligible labels', () => {
  expect(
    place([
      {corners: rectangle(0, 0, 10, 10)},
      {corners: rectangle(0, 0, 100, 100), priority: 100, eligible: false},
      {corners: rectangle(-30, 0, 10, 10)},
      {corners: rectangle(0, 0, 0, 0)},
      {corners: [-10, 0, 0, -10, 10, -10, -10, 10]}
    ])
  ).toEqual([0]);
});

test('text placement hides visible labels without whole placement data', () => {
  // Labels behind the globe write no placement data, and masks can discard part of it
  expect(
    place([
      {corners: rectangle(0, 0, 100, 30)},
      {corners: rectangle(10, 0, 100, 30), priority: 10, placementData: 'partial'},
      {corners: rectangle(20, 0, 100, 30), priority: 10, placementData: 'none'}
    ])
  ).toEqual([0]);
});

test('text placement uses the drawn parts of partly hidden labels', () => {
  // Texel rows run bottom to top, so the last row of texels tests the label's first row of parts
  const firstRow = [12, 13, 14, 15];
  const leftHalf = [0, 1, 4, 5, 8, 9, 12, 13];
  expect(
    place([
      {corners: rectangle(0, 0, 200, 40), priority: 2, drawnTexels: firstRow},
      {corners: rectangle(0, 20, 200, 20), priority: 1}
    ])
  ).toEqual([0, 1]);
  expect(
    place([
      {corners: rectangle(0, 0, 200, 40), priority: 2, drawnTexels: leftHalf},
      {corners: rectangle(120, 0, 200, 40), priority: 1},
      {corners: rectangle(20, 30, 80, 20), priority: 1},
      {corners: rectangle(0, 100, 200, 40), priority: 1, drawnTexels: leftHalf}
    ])
  ).toEqual([0, 1, 3]);
});

test('text placement skips object IDs without text', () => {
  // Non-text objects, and labels that share their feature's ID, leave gaps between label IDs.
  const labels = [0, 1, 2].map(index => ({
    corners: rectangle(index * 80, 0, 100, 30),
    priority: index
  }));
  expect(place(labels, {ids: [2, 5, 9], objectCount: 10})).toEqual([0, 2]);
});

test('text placement does not collide labels of the same row', () => {
  // Two TextLayers with the same data share picking colors but use separate visibility cells
  const labels = [
    {corners: rectangle(0, 0, 100, 30), priority: 1, pickingIndex: 1},
    {corners: rectangle(50, 10, 100, 30), pickingIndex: 1},
    {corners: rectangle(100, 0, 100, 30), priority: -1, pickingIndex: 2}
  ];
  expect(place(labels, {ids: [1, 3, 4], objectCount: 4})).toEqual([0, 1]);
});

test('text placement reads the last object of a capped-width texture', () => {
  // The visibility texture width is capped by the device limit, so cells wrap onto more rows.
  const labels = [
    {corners: rectangle(0, 0, 100, 30), priority: 1},
    {corners: rectangle(50, 0, 100, 30), priority: 2},
    {corners: rectangle(200, 0, 100, 30)}
  ];
  expect(place(labels, {ids: [1, 6, 7], objectCount: 7, columns: 2})).toEqual([1, 2]);
});
