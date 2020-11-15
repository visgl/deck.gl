import test from 'tape-catch';
import {TypedArrayManager} from '@deck.gl/core/utils/typed-array-manager';

test('TypedArrayManager#allocate', t => {
  const typedArrayManager = new TypedArrayManager({overAlloc: 2});

  // Allocate an "empty" array
  let array = typedArrayManager.allocate(null, 0, {size: 2, type: Float32Array});
  t.ok(array instanceof Float32Array, 'Allocated array has correct type');
  t.is(array.length, 1, 'Allocated array has correct length');

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
  array2 = typedArrayManager.allocate(null, 1, {size: 1, type: Uint16Array});
  t.is(array2.length, 2, 'Allocated array has correct length');
  t.is(array.buffer, array2.buffer, 'Reused released arraybuffer');

  // Existing array's underlying buffer is large enough
  array2 = typedArrayManager.allocate(array2, 4, {size: 1, type: Uint16Array});
  t.is(array2.length, 4, 'Allocated array has correct length');
  t.is(array.buffer, array2.buffer, 'Reused existing arraybuffer');

  t.end();
});

test('TypedArrayManager#initialize', t => {
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

  t.ok(array.every(Number.isFinite), 'The array is initialized');

  t.end();
});

test('TypedArrayManager#release', t => {
  const typedArrayManager = new TypedArrayManager({overAlloc: 1, poolSize: 2});

  t.doesNotThrow(() => typedArrayManager.release(null), 'Releasing null does not throw');

  [1, 3, 2, 1]
    .map(count => typedArrayManager.allocate(null, count, {size: 3, type: Float32Array}))
    .forEach(array => typedArrayManager.release(array));

  const pool = typedArrayManager._pool;

  t.is(pool.length, 2, 'Has correct pool size');
  t.deepEqual(pool.map(buffer => buffer.byteLength), [24, 36], 'Has correct buffers in pool');

  typedArrayManager.allocate(null, 8, {size: 4, type: Uint8ClampedArray});
  t.is(pool.length, 1, 'Reused released arraybuffer');
  t.deepEqual(pool.map(buffer => buffer.byteLength), [24], 'Has correct buffers in pool');

  t.end();
});
