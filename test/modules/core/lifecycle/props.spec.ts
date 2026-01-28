// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import {createProps} from '@deck.gl/core/lifecycle/create-props';
import {compareProps} from '@deck.gl/core/lifecycle/props';
import {PROP_TYPES_SYMBOL} from '@deck.gl/core/lifecycle/constants';
import {Vector2} from '@math.gl/core';

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

test('compareProps#import', () => {
  expect(compareProps, 'compareProps imported OK').toBeTruthy();
});

test('compareProps#tests', () => {
  for (const tc of TEST_CASES) {
    const result = compareProps({
      oldProps: tc.object1,
      newProps: tc.object2,
      propTypes: tc.propTypes
    });
    expect(
      result === false || typeof result === 'string',
      `compareProps ${tc.title} returned expected type`
    ).toBeTruthy();
    if (typeof result === 'string') {
      // Hack to make tape show the return value string from compareProps on failure
      const expectedResult = tc.result === SAME ? null : result;
      expect(result, `compareProps ${tc.title} returned expected result`).toBe(expectedResult);
    } else if (result === false) {
      expect(SAME, `compareProps ${tc.title} returned expected result`).toBe(tc.result);
    } else {
      throw new Error(`compareProps ${tc.title} returned illegal value`);
    }
  }
});

test('createProps', () => {
  class A {}
  A.componentName = 'A';
  A.defaultProps = {
    a: 1,
    data: [],
    c: {type: 'number', value: 0},
    c0: {deprecatedFor: 'c'}
  };

  class B extends A {}
  B.componentName = 'B';
  B.defaultProps = {b: 2};

  class ExtA {}
  ExtA.extensionName = 'ExtA';
  ExtA.defaultProps = {
    extEnabled: true
  };

  class ExtB extends ExtA {}
  ExtB.extensionName = 'ExtB';
  ExtB.defaultProps = {
    extValue: 1,
    extRange: [0, 1],
    extRange0: {deprecatedFor: 'extRange'}
  };

  let mergedProps = createProps(new B(), [{data: [0, 1]}]);

  expect(mergedProps.a, 'base class props merged').toBe(1);
  expect(mergedProps.b, 'sub class props merged').toBe(2);
  expect(mergedProps.data, 'user props merged').toEqual([0, 1]);
  expect(mergedProps.c, 'default prop value used').toBe(0);
  expect(mergedProps[PROP_TYPES_SYMBOL].a, 'prop types defined').toBeTruthy();

  mergedProps = createProps(new B(), [{c0: 4}]);
  expect(mergedProps.c, 'user props merged').toBe(4);

  mergedProps = createProps(new B(), [
    {
      extensions: [new ExtA()]
    }
  ]);
  expect(mergedProps.extEnabled, 'extension default props merged').toBe(true);
  expect(mergedProps[PROP_TYPES_SYMBOL].extEnabled, 'prop types defined').toBeTruthy();

  mergedProps = createProps(new B(), [
    {
      extRange0: [1, 100],
      extensions: [new ExtB()]
    }
  ]);
  expect(mergedProps.extValue, 'extension default props merged').toBe(1);
  expect(mergedProps.extEnabled, 'base extension default props merged').toBe(true);
  expect(mergedProps.extRange, 'user props merged').toEqual([1, 100]);
  expect(mergedProps[PROP_TYPES_SYMBOL].extValue, 'prop types defined').toBeTruthy();

  mergedProps = createProps(new B(), [{}]);
  expect(mergedProps.extEnabled, 'default props without extensions not affected').toBeFalsy();
});
