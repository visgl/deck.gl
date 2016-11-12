import test from 'tape-catch';
import {compareProps} from '../../../lib/utils/compare-objects';

const SAME = 'equal';
const NOT_SAME = 'not equal';

const NULL_OBJECT = {};

const SHALLOW_OBJECT = {
  a: 1,
  b: 2
};

const DEEP_OBJECT = {
  a: [1],
  b: [2]
};

const TEST_CASES = [
  {
    title: 'empty objects (same)',
    object1: NULL_OBJECT,
    object2: NULL_OBJECT,
    result: SAME
  }, {
    title: 'empty objects (different)',
    object1: {},
    object2: {},
    result: SAME
  }, {
    title: 'shallow objects (same)',
    object1: SHALLOW_OBJECT,
    object2: SHALLOW_OBJECT,
    result: SAME
  }, {
    title: 'shallow objects (different)',
    object1: SHALLOW_OBJECT,
    object2: {...SHALLOW_OBJECT},
    result: SAME
  }, {
    title: 'deep objects (same)',
    object1: DEEP_OBJECT,
    object2: DEEP_OBJECT,
    result: SAME
  }, {
    title: 'deep objects (different, but same nested objects)',
    object1: DEEP_OBJECT,
    object2: {...DEEP_OBJECT},
    result: SAME
  }, {
    title: 'deep objects (different nested objects)',
    object1: DEEP_OBJECT,
    object2: {a: [1], b: [2]},
    result: NOT_SAME
  }, {
    title: 'different length objects (a < b)',
    object1: {a: 1, b: 2},
    object2: {a: 1, b: 2, c: 3},
    result: NOT_SAME
  }, {
    title: 'different length objects (b > a)',
    object1: {a: 1, b: 2, c: 3},
    object2: {a: 1, b: 2},
    result: NOT_SAME
  }, {
    title: 'different objects',
    object1: {a: 1, b: 3},
    object2: {a: 1, b: 2},
    result: NOT_SAME
  }, {
    title: 'different arrays',
    object1: [1, 2, 3],
    object2: [1, 2, 4],
    result: NOT_SAME
  }, {
    title: 'equal arrays',
    object1: [1, 2, 3],
    object2: [1, 2, 3],
    result: SAME
  }
];

test('compareProps#import', t => {
  t.ok(compareProps,
    'compareProps imported OK');
  t.end();
});

test('compareProps#tests', t => {
  for (const tc of TEST_CASES) {
    const result = compareProps({oldProps: tc.object1, newProps: tc.object2});
    t.ok(result === null || typeof result === 'string',
      `compareProps ${tc.title} returned expected type`);
    let equal = 'illegal value';
    if (typeof result === 'string') {
      equal = NOT_SAME;
    } else if (result === null) {
      equal = SAME;
    }
    t.equal(equal, tc.result,
      `compareProps ${tc.title} returned expected result`);
  }
  t.end();
});
