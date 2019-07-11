import test from 'tape-catch';
import {createProps} from '@deck.gl/core/lifecycle/create-props';
import {compareProps} from '@deck.gl/core/lifecycle/props';
import {Vector2} from 'math.gl';

const SAME = 'equal';
const NOT_SAME = 'not equal';

const func = x => x;

const NULL_OBJECT = {};

const SHALLOW_OBJECT = {
  a: 1,
  b: 2
};

const DEEP_OBJECT1 = {
  a: new Vector2([0, 1]),
  b: new Vector2([1, 2])
};

const DEEP_OBJECT2 = {
  a: new Vector2([0, 1]),
  b: new Vector2([1, 2])
};

const DEEP_OBJECT3 = {
  a: new Vector2([0, 1]),
  b: new Vector2([2, 3])
};

const TEST_CASES = [
  {
    title: 'empty objects (same)',
    object1: NULL_OBJECT,
    object2: NULL_OBJECT,
    result: SAME
  },
  {
    title: 'empty objects (different)',
    object1: {},
    object2: {},
    result: SAME
  },
  {
    title: 'shallow objects (same)',
    object1: SHALLOW_OBJECT,
    object2: SHALLOW_OBJECT,
    result: SAME
  },
  {
    title: 'shallow objects (different)',
    object1: SHALLOW_OBJECT,
    object2: Object.assign({}, SHALLOW_OBJECT),
    result: SAME
  },
  {
    title: 'deep objects (different but equal nested objects)',
    object1: DEEP_OBJECT1,
    object2: DEEP_OBJECT2,
    result: SAME
  },
  {
    title: 'deep objects (different)',
    object1: DEEP_OBJECT1,
    object2: DEEP_OBJECT3,
    result: NOT_SAME
  },
  {
    title: 'deep objects (from null)',
    object1: {a: null},
    object2: DEEP_OBJECT1,
    result: NOT_SAME
  },
  {
    title: 'different length objects (a < b)',
    object1: {a: 1, b: 2},
    object2: {a: 1, b: 2, c: 3},
    result: NOT_SAME
  },
  {
    title: 'different length objects (b > a)',
    object1: {a: 1, b: 2, c: 3},
    object2: {a: 1, b: 2},
    result: NOT_SAME
  },
  {
    title: 'different objects',
    object1: {a: 1, b: 3},
    object2: {a: 1, b: 2},
    result: NOT_SAME
  },
  {
    title: 'different arrays',
    object1: [1, 2, 3],
    object2: [1, 2, 4],
    result: NOT_SAME
  },
  {
    title: 'equal arrays',
    object1: [1, 2, 3],
    object2: [1, 2, 3],
    result: SAME
  },
  {
    title: 'equal functions',
    object1: {prop: func},
    object2: {prop: func},
    result: SAME
  },
  {
    title: 'not equal functions, no hintss',
    object1: {prop: x => x},
    object2: {prop: x => x * 2},
    result: NOT_SAME
  },
  {
    title: 'not equal functions, with hints',
    object1: {prop: x => x},
    object2: {prop: x => x * 2},
    propTypes: {prop: {equal: () => true}},
    result: SAME
  },
  {
    title: 'function vs array',
    object1: {prop: x => x},
    object2: {prop: [1, 2, 3]},
    result: NOT_SAME
  },
  {
    title: 'add key#1',
    object1: Object.assign(Object.create(SHALLOW_OBJECT)),
    object2: Object.assign(Object.create(SHALLOW_OBJECT), {c: 0}),
    result: NOT_SAME
  },
  {
    title: 'add key#2',
    object1: Object.assign(Object.create(SHALLOW_OBJECT)),
    object2: Object.assign(Object.create(SHALLOW_OBJECT), {b: 3}),
    result: NOT_SAME
  },
  {
    title: 'add key#3',
    object1: Object.assign(Object.create(SHALLOW_OBJECT)),
    object2: Object.assign(Object.create(SHALLOW_OBJECT), {b: 2}),
    result: SAME
  },
  {
    title: 'drop key#1',
    object1: Object.assign(Object.create(SHALLOW_OBJECT), {c: 0}),
    object2: Object.assign(Object.create(SHALLOW_OBJECT)),
    result: NOT_SAME
  },
  {
    title: 'drop key#2',
    object1: Object.assign(Object.create(SHALLOW_OBJECT), {b: 3}),
    object2: Object.assign(Object.create(SHALLOW_OBJECT)),
    result: NOT_SAME
  },
  {
    title: 'drop key#3',
    object1: Object.assign(Object.create(SHALLOW_OBJECT), {b: 2}),
    object2: Object.assign(Object.create(SHALLOW_OBJECT)),
    result: SAME
  }
];

test('compareProps#import', t => {
  t.ok(compareProps, 'compareProps imported OK');
  t.end();
});

test('compareProps#tests', t => {
  for (const tc of TEST_CASES) {
    const result = compareProps({
      oldProps: tc.object1,
      newProps: tc.object2,
      propTypes: tc.propTypes
    });
    t.ok(
      result === null || typeof result === 'string',
      `compareProps ${tc.title} returned expected type`
    );
    if (typeof result === 'string') {
      // Hack to make tape show the return value string from compareProps on failure
      const expectedResult = tc.result === SAME ? null : result;
      t.equal(result, expectedResult, `compareProps ${tc.title} returned expected result`);
    } else if (result === null) {
      t.equal(SAME, tc.result, `compareProps ${tc.title} returned expected result`);
    } else {
      t.fail(`compareProps ${tc.title} returned illegal value`);
    }
  }
  t.end();
});

test('createProps', t => {
  class A {}
  A.defaultProps = {
    a: 1,
    data: [],
    c: {type: 'number', value: 0},
    c0: {deprecatedFor: 'c'}
  };

  class B extends A {}
  B.defaultProps = {b: 2};

  let mergedProps = createProps.call(new B(), {data: [0, 1]});

  t.equal(mergedProps.a, 1, 'base class props merged');
  t.equal(mergedProps.b, 2, 'sub class props merged');
  t.deepEqual(mergedProps.data, [0, 1], 'user props merged');
  t.equal(mergedProps.c, 0, 'default prop value used');

  mergedProps = createProps.call(new B(), {c0: 4});

  t.deepEqual(mergedProps.c, 4, 'user props merged');

  t.end();
});
