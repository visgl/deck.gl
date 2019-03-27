"use strict";var test;module.link('tape-catch',{default(v){test=v}},0);var count,map,values,isKeyedContainer,keys,entries;module.link('@deck.gl/core/experimental/utils/container',{count(v){count=v},map(v){map=v},values(v){values=v},isKeyedContainer(v){isKeyedContainer=v},keys(v){keys=v},entries(v){entries=v}},1);// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.











const ITERATOR_TEST_CASES = [
  {
    title: 'object',
    container: {a: 1, b: 2, c: 3},
    values: [1, 2, 3],
    keys: ['a', 'b', 'c']
  },
  {
    title: 'Array',
    container: [1, 2, 3],
    values: [1, 2, 3]
  }
  // TODO - "values()" over these classes are broken, but not used at the moment
  // {
  //   title: 'ES6 Map',
  //   container: new Map([['a', 1], ['b', 2], ['c', 3]]),
  //   values: [1, 2, 3],
  //   keys: ['a', 'b', 'c']
  // },
  // {
  //   title: 'ES6 Set',
  //   container: new Set([1, 2, 3]),
  //   values: [1, 2, 3]
  // },
  // {
  //   title: 'Immutable.Map',
  //   container: new Immutable.Map([['a', 1], ['b', 2], ['c', 3]]),
  //   values: [1, 2, 3],
  //   keys: ['a', 'b', 'c']
  // },
  // {
  //   title: 'Immutable.List',
  //   container: new Immutable.List([1, 2, 3]),
  //   values: [1, 2, 3]
  // }
];

test('container#import', t => {
  t.ok(typeof values === 'function', 'values imported OK');
  t.ok(typeof isKeyedContainer === 'function', 'isKeyedContainer imported OK');
  t.ok(typeof keys === 'function', 'keys imported OK');
  t.ok(typeof entries === 'function', 'entries imported OK');
  t.end();
});

test('container#count, values, keys, entries, isKeyedContainer, map', t => {
  for (const tc of ITERATOR_TEST_CASES) {
    // Test that count() works
    const c = count(tc.container);
    t.equal(c, tc.values.length, `count() on ${tc.title} returned expected result`);

    // Test that values() works
    let result = [];
    for (const element of values(tc.container)) {
      result.push(element);
    }
    t.deepEqual(result, tc.values, `values() on ${tc.title} returned expected result`);

    // Test if isKeyed works
    const isKeyed = isKeyedContainer(tc.container);
    t.deepEqual(isKeyed, Boolean(tc.keys), `isKeyedContainer() on ${tc.title} correct`);

    if (isKeyed) {
      // Test that keys() works
      result = [];
      for (const element of keys(tc.container)) {
        result.push(element);
      }
      t.deepEqual(result, tc.keys, `keys() on ${tc.title} returned expected result`);

      // Test that entries() works
      result = [];
      const resultKeys = [];
      for (const element of entries(tc.container)) {
        resultKeys.push(element[0]);
        result.push(element[1]);
      }
      t.deepEqual(resultKeys, tc.keys, `entries() on ${tc.title} returned expected keys`);
      t.deepEqual(result, tc.values, `entries() on ${tc.title} returned expected values`);
    }

    // Test that map() works
    result = map(tc.container, x => x);
    t.deepEqual(result, tc.values, `map() on ${tc.title} returned expected values`);
  }
  t.end();
});
