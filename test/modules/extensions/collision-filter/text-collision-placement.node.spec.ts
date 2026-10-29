// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {placeTextLabels} from '@deck.gl/extensions/collision-filter/text-collision-placement';

type Label = {corners: number[]; priority?: number; eligible?: boolean};
const WIDTH = 400;
const HEIGHT = 200;

function rectangle(x: number, y: number, width: number, height: number): number[] {
  return [x, y, x + width, y, x + width, y + height, x, y + height];
}

function place(labels: Label[]): number[] {
  const columns = Math.ceil(Math.sqrt(labels.length + 1));
  const width = columns * 4;
  const stride = width * 4;
  const pixels = new Uint8Array(Math.ceil((labels.length + 1) / columns) * 4 * stride);
  const view = new DataView(pixels.buffer);
  const base = (index: number) => Math.floor(index / columns) * 4 * stride + (index % columns) * 16;
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    const values = [
      ...label.corners.map((value, axis) => value / (axis % 2 ? HEIGHT : WIDTH)),
      label.priority || 0,
      1
    ];
    values.forEach((value, component) => {
      view.setFloat32(
        base(i + 1) + Math.floor(component / 4) * stride + (component % 4) * 4,
        value,
        true
      );
    });
    for (let component = 10; component < 16; component++) {
      pixels[base(i + 1) + Math.floor(component / 4) * stride + (component % 4) * 4] =
        label.eligible === false ? 0 : 255;
    }
  }
  const count = placeTextLabels(pixels, width, labels.length, WIDTH, HEIGHT);
  const result = labels.flatMap((_, i) => (pixels[base(i + 1) + 3 * stride + 12] ? [i] : []));
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
