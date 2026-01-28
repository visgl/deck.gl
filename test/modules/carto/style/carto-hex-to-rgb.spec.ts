// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import {hexToRgb} from '@deck.gl/carto/style/palette';

const OK_TEST_CASES = [
  {
    title: 'Evaluate #ABC',
    argument: '#AAA',
    result: [170, 170, 170, 255]
  },
  {
    title: 'Evaluate #ABCDEF',
    argument: '#FFEE11',
    result: [255, 238, 17, 255]
  },
  {
    title: 'Evaluate #ABCDEFAF',
    argument: '#00FF0080',
    result: [0, 255, 0, 128]
  }
];

const ERROR_TEST_CASES = [
  {
    argument: '#notAColor'
  },
  {
    argument: 'notAColor'
  }
];

test('hexToRgb#tests', () => {
  for (const tc of OK_TEST_CASES) {
    const func = hexToRgb(tc.argument);
    expect(func, `${tc.title} returned expected result`).toEqual(tc.result);
  }
});

test('hexToRgb#invalidData', () => {
  for (const tc of ERROR_TEST_CASES) {
    expect(
      () => hexToRgb(tc.argument),
      `throws on invalid hexadecimal color ${tc.argument}`
    ).toThrow();
  }
});
