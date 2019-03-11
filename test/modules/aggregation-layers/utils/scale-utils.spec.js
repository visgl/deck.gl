import test from 'tape-catch';
import {quantizeScale} from '@deck.gl/aggregation-layers/utils/scale-utils';

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
