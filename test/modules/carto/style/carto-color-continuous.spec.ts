import test from 'tape-catch';
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

test('colorContinuous', t => {
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
    t.deepEqual(func, tc.result, `colorContinuous ${tc.title} returned expected result`);
  }

  t.end();
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

test('colorContinuous#colorsAsCARTOColors', t => {
  const colorContinuousManual = colorContinuous({
    attr: 'target',
    domain: [0, 100],
    colors: 'SunsetDark'
  });

  for (const tc of CONTINUOUS_TEST_CASES_USING_CARTO_COLORS) {
    const func = colorContinuousManual(tc.argument);
    t.deepEqual(func, tc.result, `colorContinuous ${tc.title} returned expected result`);
  }

  t.end();
});

test('colorContinuous#invalidColorsArgument', t => {
  for (const tc of ERROR_TEST_CASES_COLORS) {
    t.throws(
      () =>
        colorContinuous({
          attr: 'target',
          domain: tc.domain,
          colors: tc.colors
        }),
      `throws on invalid colors ${tc.colors}`
    );
  }

  t.end();
});

test('colorContinuous#invalidDomainArgument', t => {
  for (const tc of ERROR_TEST_CASES_DOMAIN) {
    t.throws(
      () =>
        colorContinuous({
          attr: 'target',
          domain: tc.domain,
          colors: tc.colors
        }),
      `throws on invalid domain ${tc.domain}`
    );
  }

  t.end();
});
