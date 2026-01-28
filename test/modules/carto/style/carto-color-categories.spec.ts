// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import {colorCategories} from '@deck.gl/carto';

const CATEGORIES_TEST_CASES = [
  {
    title: 'Feature 1',
    argument: {
      properties: {
        target: 'Category 1'
      }
    },
    result: [255, 0, 0]
  },
  {
    title: 'Feature 2',
    argument: {
      properties: {
        target: 'Category 2'
      }
    },
    result: [0, 255, 0]
  },
  {
    title: 'Feature 3',
    argument: {
      properties: {
        target: 'Category 3'
      }
    },
    result: [0, 0, 255]
  }
];

const ERROR_TEST_CASES_COLORS = [
  {
    title: 'Feature with invalid colors',
    domain: ['Category 1', 'Category 2', 'Category 3'],
    colors: null
  }
];

const ERROR_TEST_CASES_CATEGORIES = [
  {
    title: 'Feature with invalid domain',
    domain: -1,
    colors: 'Mint'
  }
];

test('colorCategories', () => {
  const colorCategoriesManual = colorCategories({
    attr: 'target',
    domain: ['Category 1', 'Category 2', 'Category 3'],
    colors: [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255]
    ]
  });

  for (const tc of CATEGORIES_TEST_CASES) {
    const func = colorCategoriesManual(tc.argument);
    expect(func, `colorCategories ${tc.title} returned expected result`).toEqual(tc.result);
  }
});

test('colorCategories#invalidColorsArgument', () => {
  for (const tc of ERROR_TEST_CASES_COLORS) {
    expect(
      () =>
        colorCategories({
          attr: 'target',
          domain: tc.domain,
          colors: tc.colors
        }),
      `throws on invalid colors ${tc.colors}`
    ).toThrow();
  }
});

test('colorCategories#invalidCategoriesArgument', () => {
  for (const tc of ERROR_TEST_CASES_CATEGORIES) {
    expect(
      () =>
        colorCategories({
          attr: 'target',
          domain: tc.domain,
          colors: tc.colors
        }),
      `throws on invalid domain ${tc.domain}`
    ).toThrow();
  }
});
