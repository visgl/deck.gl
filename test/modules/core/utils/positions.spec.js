import test from 'tape-catch';
import {parsePosition, getPosition} from '@deck.gl/core/utils/positions';

const PARSE_TEST_CASES = [
  {
    title: 'number',
    value: 10,
    result: {position: 10, relative: false}
  },
  {
    title: 'percent string',
    value: '10%',
    result: {position: 0.1, relative: true}
  },
  {
    title: 'percent string',
    value: '33.3%',
    result: {position: 0.333, relative: true}
  },
  {
    title: 'pixel string',
    value: '10px',
    result: {position: 10, relative: false}
  }
];

const GET_TEST_CASES = [
  {
    title: 'absolute',
    position: {position: 10, relative: false},
    extent: 101,
    result: 10
  },
  {
    title: 'relative',
    position: {position: 0.1, relative: true},
    extent: 101,
    result: 10
  }
];

test('positions#import', t => {
  t.ok(parsePosition, 'parsePosition imported OK');
  t.ok(getPosition, 'getPosition imported OK');
  t.end();
});

test('parsePosition#tests', t => {
  for (const tc of PARSE_TEST_CASES) {
    const result = parsePosition(tc.value);
    result.position = result.position.toPrecision(5);
    tc.result.position = tc.result.position.toPrecision(5);
    t.deepEqual(result, tc.result, `parsePosition ${tc.title} returned expected type`);
  }
  t.end();
});

test('getPosition#tests', t => {
  for (const tc of GET_TEST_CASES) {
    const result = getPosition(tc.position, tc.extent);
    t.deepEqual(result, tc.result, `getPosition ${tc.title} returned expected type`);
  }
  t.end();
});
