// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
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

test('color#parseColor', t => {
  for (const tc of TEST_CASES) {
    const arg = tc.argument.slice();
    const result = parseColor(arg);
    t.deepEqual(result, tc.result, `parseColor ${tc.title} returned expected result`);
    const target = [];
    parseColor(arg, target);
    t.deepEqual(target, tc.result, `parseColor ${tc.title} returned expected result`);
    t.deepEqual(arg, tc.argument, `parseColor ${tc.title} did not mutate input`);
  }
  t.end();
});

test('color#applyOpacity', t => {
  const rgb = [255, 245, 235];
  let result = applyOpacity(rgb);
  t.deepEqual(result, [255, 245, 235, 127], 'applyOpacity added default opacity');
  result = applyOpacity(rgb, 255);
  t.deepEqual(result, [255, 245, 235, 255], 'applyOpacity added opacity');
  t.deepEqual(rgb, [255, 245, 235], 'applyOpacity did not mutate input');

  t.end();
});
