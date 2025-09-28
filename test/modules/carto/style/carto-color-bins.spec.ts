// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-catch';
import {colorBins} from '@deck.gl/carto';

const OK_TEST_CASES = [
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
    result: [0, 255, 0]
  },
  {
    title: 'Feature 3',
    argument: {
      properties: {
        target: 100
      }
    },
    result: [0, 0, 255]
  }
];

const ERROR_TEST_CASES_COLORS = [
  {
    title: 'Feature with invalid colors',
    domain: [1, 50, 100],
    colors: null
  }
];

const ERROR_TEST_CASES_DOMAIN = [
  {
    title: 'Feature with invalid domain',
    domain: -1,
    colors: [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255]
    ]
  }
];

test('colorBins', t => {
  const colorBinsManual = colorBins({
    attr: 'target',
    domain: [50, 100],
    // [,50) -> colors[0]
    // [50, 100) -> colors[1]
    // [100,] --> colors[2]
    colors: [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255]
    ]
  });

  for (const tc of OK_TEST_CASES) {
    const func = colorBinsManual(tc.argument);
    t.deepEqual(func, tc.result, `colorBins ${tc.title} returned expected result`);
  }

  t.end();
});

const TEST_CASES_USING_CARTO_COLORS = [
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
        target: 75
      }
    },
    result: [227, 79, 111, 255]
  },
  {
    title: 'Feature 3',
    argument: {
      properties: {
        target: 125
      }
    },
    result: [124, 29, 111, 255]
  }
];

test('colorBins#colorsAsCARTOColors', t => {
  const colorBinsManual = colorBins({
    attr: 'target',
    domain: [50, 100],
    colors: 'SunsetDark'
  });

  for (const tc of TEST_CASES_USING_CARTO_COLORS) {
    const func = colorBinsManual(tc.argument);
    t.deepEqual(func, tc.result, `colorBins ${tc.title} returned expected result`);
  }

  t.end();
});

test('colorBins#invalidColorsArgument', t => {
  for (const tc of ERROR_TEST_CASES_COLORS) {
    t.throws(
      () =>
        colorBins({
          attr: 'target',
          domain: tc.domain,
          colors: tc.colors
        }),
      `throws on invalid colors ${tc.colors}`
    );
  }

  t.end();
});

test('colorBins#invalidDomainArgument', t => {
  for (const tc of ERROR_TEST_CASES_DOMAIN) {
    t.throws(
      () =>
        colorBins({
          attr: 'target',
          domain: tc.domain,
          colors: tc.colors
        }),
      `throws on invalid domain ${tc.domain}`
    );
  }

  t.end();
});
