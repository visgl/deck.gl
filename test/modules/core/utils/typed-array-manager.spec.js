import test from 'tape-catch';
import {TypedArrayManager} from '@deck.gl/core/utils/typed-array-manager';

test('TypedArrayManager#allocate', t => {
  const typedArrayManager = new TypedArrayManager({overAlloc: 2});

  // Allocate an "empty" array
  let array = typedArrayManager.allocate(null, 0, {size: 2, type: Float32Array});
  t.ok(array instanceof Float32Array, 'Allocated array has correct type');
  t.ok(array.length, 'Allocated array has length');

  // Create a new array with over allocation
  array = typedArrayManager.allocate(null, 1, {size: 2, type: Float32Array});
  t.ok(array instanceof Float32Array, 'Allocated array has correct type');
  t.is(array.length, 4, 'Allocated array has correct length');
  array.fill(1);

  // Existing array is large enough
  let array2 = typedArrayManager.allocate(array, 2, {size: 2, type: Float32Array, copy: true});
  t.is(array, array2, 'Did not allocate new array');

  // Existing array is not large enough, release the old one and allocate new array
  array2 = typedArrayManager.allocate(array, 3, {size: 2, type: Float32Array, copy: true});
  t.is(array2.length, 12, 'Newly allocated array has correct length');
  t.deepEqual(array2, [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], 'Copied existing array');

  // Reuse a released array from pool
  array2 = typedArrayManager.allocate(null, 1, {size: 2, type: Float32Array});
  t.is(array, array2, 'Reused released array');

  t.end();
});

test('TypedArrayManager#release', t => {
  const typedArrayManager = new TypedArrayManager({overAlloc: 1, poolSize: 2});

  t.doesNotThrow(() => typedArrayManager.release(null), 'Releasing null does not throw');

  for (let i = 1; i <= 3; i++) {
    const floatArr = typedArrayManager.allocate(null, i, {size: 3, type: Float32Array});
    const byteArr = typedArrayManager.allocate(null, i, {size: 1, type: Uint8ClampedArray});

    typedArrayManager.release(floatArr);
    typedArrayManager.release(byteArr);
  }

  const floatArraysPool = typedArrayManager._pool.Float32Array;
  const byteArraysPool = typedArrayManager._pool.Uint8ClampedArray;

  t.is(floatArraysPool.length, 2, 'Has correct pool size');
  t.deepEqual(floatArraysPool.map(arr => arr.length), [9, 6], 'Has correct arrays in pool');
  t.is(byteArraysPool.length, 2, 'Has correct pool size');
  t.deepEqual(byteArraysPool.map(arr => arr.length), [3, 2], 'Has correct arrays in pool');

  typedArrayManager.allocate(null, 2, {size: 4, type: Float32Array});
  t.is(floatArraysPool.length, 1, 'Reused released array');
  t.deepEqual(floatArraysPool.map(arr => arr.length), [6], 'Has correct arrays in pool');

  t.end();
});
