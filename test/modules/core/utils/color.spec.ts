// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import color from '@deck.gl/core/utils/color';
const {parseColor, applyOpacity} = color;

const TEST_CASES = [
  {
    title: '4 element array',
    argument: [127, 128, 129, 130],
    result: [127, 128, 129, 130]
  },
  {
    title: '3 element array',
    argument: [127, 128, 129],
    result: [127, 128, 129, 255]
  },
  {
    title: '3 component hex string',
    argument: '#ff8000',
    result: [255, 128, 0, 255]
  },
  {
    title: '4 component hex string',
    argument: '#10101010',
    result: [16, 16, 16, 16]
  }
];

test('color#parseColor', () => {
  for (const tc of TEST_CASES) {
    const arg = tc.argument.slice();
    const result = parseColor(arg);
    expect(result, `parseColor ${tc.title} returned expected result`).toEqual(tc.result);
    const target = [];
    parseColor(arg, target);
    expect(target, `parseColor ${tc.title} returned expected result`).toEqual(tc.result);
    expect(arg, `parseColor ${tc.title} did not mutate input`).toEqual(tc.argument);
  }
});

test('color#applyOpacity', () => {
  const rgb = [255, 245, 235];
  let result = applyOpacity(rgb);
  expect(result, 'applyOpacity added default opacity').toEqual([255, 245, 235, 127]);
  result = applyOpacity(rgb, 255);
  expect(result, 'applyOpacity added opacity').toEqual([255, 245, 235, 255]);
  expect(rgb, 'applyOpacity did not mutate input').toEqual([255, 245, 235]);
});
