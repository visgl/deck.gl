import test from 'tape-catch';
import {parseColor} from 'deck.gl/lib/utils/color';

const TEST_CASES = [
  {
    title: '4 element array',
    argument: [127, 128, 129, 130],
    result: [127, 128, 129, 130]
  }, {
    title: '3 element array',
    argument: [127, 128, 129],
    result: [127, 128, 129, 255]
  }, {
    title: '3 component hex string',
    argument: '#ff8000',
    result: [255, 128, 0, 255]
  }, {
    title: '4 component hex string',
    argument: '#10101010',
    result: [16, 16, 16, 16]
  }
];

test('color#import', t => {
  t.ok(typeof parseColor === 'function', 'parseColor imported OK');
  t.end();
});

test('color#parseColor', t => {
  for (const tc of TEST_CASES) {
    const result = parseColor(tc.argument);
    t.deepEqual(result, tc.result, `parseColor ${tc.title} returned expected result`);
  }
  t.end();
});
