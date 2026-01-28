// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import {colorContinuous} from '@deck.gl/carto';

const CONTINUOUS_TEST_CASES = [
  {
    title: 'Feature 1',
    argument: {
      properties: {
        target: 0
      }
    },
    result: [255, 0, 0]
  },
  {
    title: 'Feature 2',
    argument: {
      properties: {
        target: 50
      }
    },
    result: [255, 127.5, 0]
  },
  {
    title: 'Feature 3',
    argument: {
      properties: {
        target: 100
      }
    },
    result: [255, 255, 0]
  }
];

const ERROR_TEST_CASES_COLORS = [
  {
    title: 'Feature with invalid colors',
    domain: [0, 100],
    colors: null
  }
];

const ERROR_TEST_CASES_DOMAIN = [
  {
    title: 'Feature with invalid domain',
    domain: -1,
    colors: [
      [255, 0, 0],
      [255, 255, 0]
    ]
  }
];

test('colorContinuous', () => {
  const colorContinuousManual = colorContinuous({
    attr: 'target',
    domain: [0, 100],
    colors: [
      [255, 0, 0],
      [255, 255, 0]
    ]
  });

  for (const tc of CONTINUOUS_TEST_CASES) {
    const func = colorContinuousManual(tc.argument);
    expect(func, `colorContinuous ${tc.title} returned expected result`).toEqual(tc.result);
  }
});

const CONTINUOUS_TEST_CASES_USING_CARTO_COLORS = [
  {
    title: 'Feature 1',
    argument: {
      properties: {
        target: 0
      }
    },
    result: [252, 222, 156, 255]
  },
  {
    title: 'Feature 2',
    argument: {
      properties: {
        target: 100
      }
    },
    result: [124, 29, 111, 255]
  }
];

test('colorContinuous#colorsAsCARTOColors', () => {
  const colorContinuousManual = colorContinuous({
    attr: 'target',
    domain: [0, 100],
    colors: 'SunsetDark'
  });

  for (const tc of CONTINUOUS_TEST_CASES_USING_CARTO_COLORS) {
    const func = colorContinuousManual(tc.argument);
    expect(func, `colorContinuous ${tc.title} returned expected result`).toEqual(tc.result);
  }
});

test('colorContinuous#invalidColorsArgument', () => {
  for (const tc of ERROR_TEST_CASES_COLORS) {
    expect(
      () =>
        colorContinuous({
          attr: 'target',
          domain: tc.domain,
          colors: tc.colors
        }),
      `throws on invalid colors ${tc.colors}`
    ).toThrow();
  }
});

test('colorContinuous#invalidDomainArgument', () => {
  for (const tc of ERROR_TEST_CASES_DOMAIN) {
    expect(
      () =>
        colorContinuous({
          attr: 'target',
          domain: tc.domain,
          colors: tc.colors
        }),
      `throws on invalid domain ${tc.domain}`
    ).toThrow();
  }
});
