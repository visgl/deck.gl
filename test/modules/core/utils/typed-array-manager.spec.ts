// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {TypedArrayManager} from '@deck.gl/core/utils/typed-array-manager';

test('TypedArrayManager#allocate', () => {
  const typedArrayManager = new TypedArrayManager({overAlloc: 2});

  // Allocate an "empty" array
  let array = typedArrayManager.allocate(null, 0, {size: 2, type: Float32Array});
  expect(array instanceof Float32Array, 'Allocated array has correct type').toBeTruthy();
  expect(array.length, 'Allocated array has correct length').toBe(1);

  // Create a new array with over allocation
  array = typedArrayManager.allocate(null, 1, {size: 2, type: Float32Array});
  expect(array instanceof Float32Array, 'Allocated array has correct type').toBeTruthy();
  expect(array.length, 'Allocated array has correct length').toBe(4);
  array.fill(1);

  // Existing array is large enough
  let array2 = typedArrayManager.allocate(array, 2, {size: 2, type: Float32Array, copy: true});
  expect(array, 'Did not allocate new array').toBe(array2);

  // Existing array is not large enough, release the old one and allocate new array
  array2 = typedArrayManager.allocate(array, 3, {size: 2, type: Float32Array, copy: true});
  expect(array2.length, 'Newly allocated array has correct length').toBe(12);
  expect(array2, 'Copied existing array').toEqual([1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0]);

  // Reuse a released array from pool
  array2 = typedArrayManager.allocate(null, 1, {size: 1, type: Uint16Array});
  expect(array2.length, 'Allocated array has correct length').toBe(2);
  expect(array.buffer, 'Reused released arraybuffer').toBe(array2.buffer);

  // Existing array's underlying buffer is large enough
  array2 = typedArrayManager.allocate(array2, 4, {size: 1, type: Uint16Array});
  expect(array2.length, 'Allocated array has correct length').toBe(4);
  expect(array.buffer, 'Reused existing arraybuffer').toBe(array2.buffer);

  // Create a new array with over allocation.
  // Allocated array with over allocation should be smaller than over allocation cap.
  // 2 elements x 2 bytes x 2 default over alloc => 8
  array = typedArrayManager.allocate(null, 2, {size: 2, type: Float32Array, maxCount: 5});
  expect(array.length, 'Allocated array has correct length, not affected by over alloc cap').toBe(
    8
  );

  // Create a new array with over allocation.
  // Allocated array with over allocation is capped by over allocation cap.
  // 3 elements x 2 bytes x 2 default over alloc => 12; max count limits allocation to 10.
  array = typedArrayManager.allocate(null, 3, {size: 2, type: Float32Array, maxCount: 5});
  expect(array.length, 'Allocated array has correct length, affected by over alloc cap').toBe(10);
});

test('TypedArrayManager#initialize', () => {
  const typedArrayManager = new TypedArrayManager({overAlloc: 1, poolSize: 1});

  let array = typedArrayManager.allocate(null, 32, {size: 1, type: Uint8Array});
  array.fill(255);
  typedArrayManager.release(array);

  array = typedArrayManager.allocate(null, 2, {
    size: 3,
    padding: 2,
    type: Float32Array,
    initialize: true
  });

  expect(array.every(Number.isFinite), 'The array is initialized').toBeTruthy();
});

test('TypedArrayManager#release', () => {
  const typedArrayManager = new TypedArrayManager({overAlloc: 1, poolSize: 2});

  expect(() => typedArrayManager.release(null), 'Releasing null does not throw').not.toThrow();

  [1, 3, 2, 1]
    .map(count => typedArrayManager.allocate(null, count, {size: 3, type: Float32Array}))
    .forEach(array => typedArrayManager.release(array));

  const pool = typedArrayManager._pool;

  expect(pool.length, 'Has correct pool size').toBe(2);
  expect(
    pool.map(buffer => buffer.byteLength),
    'Has correct buffers in pool'
  ).toEqual([24, 36]);

  typedArrayManager.allocate(null, 8, {size: 4, type: Uint8ClampedArray});
  expect(pool.length, 'Reused released arraybuffer').toBe(1);
  expect(
    pool.map(buffer => buffer.byteLength),
    'Has correct buffers in pool'
  ).toEqual([24]);
});
