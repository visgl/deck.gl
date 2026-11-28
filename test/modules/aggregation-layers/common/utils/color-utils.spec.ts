// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {
  colorRangeToFlatArray,
  packColorRange
} from '@deck.gl/aggregation-layers/common/utils/color-utils';

test('color-utils#colorRangeToFlatArray', () => {
  const TESTS = [
    {
      title: 'flat array',
      colorRange: [255, 0, 0, 0, 255, 255, 0, 255],
      normalize: false,
      output: [255, 0, 0, 0, 255, 255, 0, 255]
    },
    {
      title: 'flat array normalized',
      colorRange: [255, 0, 0, 0, 255, 255, 0, 255],
      normalize: true,
      output: [1, 0, 0, 0, 1, 1, 0, 1]
    },
    {
      title: 'nested array',
      colorRange: [
        [255, 0, 0, 0],
        [255, 255, 0]
      ],
      normalize: false,
      output: [255, 0, 0, 0, 255, 255, 0, 255]
    },
    {
      title: 'nested array normalized',
      colorRange: [
        [255, 0, 0, 0],
        [255, 255, 0]
      ],
      normalize: true,
      output: [1, 0, 0, 0, 1, 1, 0, 1]
    }
  ];

  for (const testCase of TESTS) {
    expect(colorRangeToFlatArray(testCase.colorRange, testCase.normalize), testCase.title).toEqual(
      testCase.output
    );
  }
});

test('color-utils#preserves palette storage and alpha', () => {
  const palette = [
    [128, 64, 255, 0],
    [255, 128, 64]
  ];
  expect(Array.from(colorRangeToFlatArray(palette, false, Uint8Array))).toEqual([
    128, 64, 255, 0, 255, 128, 64, 255
  ]);
  const normalized = colorRangeToFlatArray(palette, true);
  expect(normalized[0]).toBeCloseTo(128 / 255);
  expect(normalized[3]).toBe(0);
  expect(normalized[7]).toBe(1);
  expect(palette).toEqual([
    [128, 64, 255, 0],
    [255, 128, 64]
  ]);
});

test('color-utils#packs normalized palette entries at the texture boundary', () => {
  const palette: Parameters<typeof packColorRange>[0] = [
    new Uint8Array([16, 32, 64]),
    [1, 0.5, 0, 0],
    [0, 0.5, 1]
  ];
  expect(packColorRange(palette, true)).toEqual(
    new Uint8Array([16, 32, 64, 255, 255, 128, 0, 0, 0, 128, 255, 255])
  );
  expect(packColorRange(palette, false)).toEqual(
    new Uint8Array([16, 32, 64, 255, 1, 0, 0, 0, 0, 0, 1, 255])
  );
  const flatBytes = new Uint8Array([255, 128, 64, 0]);
  expect(packColorRange(flatBytes, true)).toEqual(flatBytes);
});
