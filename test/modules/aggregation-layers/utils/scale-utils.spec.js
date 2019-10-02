import test from 'tape-catch';
import {
  quantizeScale,
  getQuantileScale,
  getOrdinalScale
} from '@deck.gl/aggregation-layers/utils/scale-utils';

const RANGE = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
const QUANTIZE_SCALE_TEST_CASES = [
  {
    title: 'multi-value-domain',
    domain: [1, 10],
    range: RANGE,
    value: 5,
    result: 500
  },
  {
    title: 'single-value-domain',
    domain: [1, 1],
    range: RANGE,
    value: 1,
    result: RANGE[0]
  },
  {
    title: 'negative-value-domain',
    domain: [10, 1],
    range: RANGE,
    value: 1,
    result: RANGE[0]
  }
];

const QUANTILE_SCALE_TEST_CASES = [
  {
    title: 'multi-value-domain',
    domain: [3, 6, 7, 8, 8, 10, 13, 15, 16, 20],
    range: [11, 22, 33, 44],
    values: [1, 3, 6, 6.9, 7, 7.1, 8, 8.9, 9, 9.1, 10, 13, 14.9, 15, 15.1, 16, 20, 100],
    results: [11, 11, 11, 11, 11, 11, 22, 22, 33, 33, 33, 33, 44, 44, 44, 44, 44, 44]
  },
  {
    title: 'unsorted-domain',
    domain: [8, 16, 15, 3, 6, 7, 8, 20, 10, 13],
    range: [11, 22, 33, 44],
    values: [1, 3, 6, 6.9, 7, 7.1, 8, 8.9, 9, 9.1, 10, 13, 14.9, 15, 15.1, 16, 20, 100],
    results: [11, 11, 11, 11, 11, 11, 22, 22, 33, 33, 33, 33, 44, 44, 44, 44, 44, 44]
  },
  {
    title: 'single-value-domain',
    domain: [8],
    range: [11, 22, 33, 44],
    values: [1, 3, 6, 6.9, 7, 7.1, 8, 8.9, 9, 9.1, 10, 13, 14.9, 15, 15.1, 16, 20, 100],
    results: [11, 11, 11, 11, 11, 11, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44]
  },
  {
    title: 'single-value-range',
    domain: [3, 6, 7, 8, 8, 10, 13, 15, 16, 20],
    range: [11],
    values: [1, 3, 6, 6.9, 7, 7.1, 8, 8.9, 9, 9.1, 10, 13, 14.9, 15, 15.1, 16, 20, 44],
    result: 11
  }
];

const ORDINAL_SCALE_TEST_CASES = [
  {
    title: 'uniquely-maps-domain-to-range',
    domain: [0, 1],
    range: [11, 22],
    values: [0, 1],
    results: [11, 22]
  },
  {
    title: 'string-value-domain',
    domain: ['0', '1'],
    range: [11, 22],
    values: [0, '0', 1, '1'],
    results: [11, 11, 22, 22]
  },
  {
    title: 'extends-domain',
    domain: [0, 1],
    range: [11, 22, 33],
    values: [0, 1, 2],
    results: [11, 22, 33]
  },
  {
    title: 'recycles values',
    domain: [0, 1],
    range: [11, 22, 33],
    values: [0, 1, 2, 3, 4, 5, 6],
    results: [11, 22, 33, 11, 22, 33, 11]
  }
];

test('scale-utils#import', t => {
  t.ok(quantizeScale, 'quantizeScale imported OK');
  t.end();
});

test('scale-utils#quantizeScale', t => {
  for (const tc of QUANTIZE_SCALE_TEST_CASES) {
    const result = quantizeScale(tc.domain, tc.range, tc.value);
    t.deepEqual(result, tc.result, `quantizeScale ${tc.title} returned expected value`);
  }
  t.end();
});

test('scale-utils#quantileScale', t => {
  for (const tc of QUANTILE_SCALE_TEST_CASES) {
    const quantileScale = getQuantileScale(tc.domain, tc.range);
    t.deepEqual(
      quantileScale.domain(),
      tc.domain,
      `quantileScale.domain() ${tc.title} returned expected value`
    );
    for (const i in tc.values) {
      const result = quantileScale(tc.values[i]);
      t.deepEqual(
        result,
        tc.results ? tc.results[i] : tc.result,
        `quantileScale ${tc.title} returned expected value`
      );
    }
  }
  t.end();
});

test('scale-utils#ordinalScale', t => {
  for (const tc of ORDINAL_SCALE_TEST_CASES) {
    const ordinalScale = getOrdinalScale(tc.domain, tc.range);
    t.deepEqual(
      ordinalScale.domain(),
      tc.domain,
      `ordinalScale.domain() ${tc.title} returned expected value`
    );
    for (const i in tc.values) {
      const result = ordinalScale(tc.values[i]);
      t.deepEqual(result, tc.results[i], `ordinalScale ${tc.title} returned expected value`);
    }
  }
  t.end();
});
