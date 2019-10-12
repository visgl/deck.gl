import test from 'tape-promise/tape';
import {toDoublePrecisionArray} from '@deck.gl/gpu-table/lib/utils/double-precision';
import {equals} from 'math.gl';

function fromDoublePrecisionArray(array, size) {
  const result = [];
  let i = 0;
  while (i < array.length) {
    result.push(array[i] + array[i + size]);
    i++;
    if (i % size === 0) {
      i += size;
    }
  }
  return result;
}

test('toDoublePrecisionArray', t => {
  const array = Array.from({length: 10}, (d, i) => i + Math.PI);
  let array64 = toDoublePrecisionArray(array, {size: 2});
  t.ok(array64 instanceof Float32Array, 'returns correct type');
  t.is(array64.length, 20, 'returns correct length');
  t.ok(equals(fromDoublePrecisionArray(array64, 2), array), 'array reconstructs ok');

  array64 = toDoublePrecisionArray(array, {size: 2, startIndex: 4, endIndex: 8});
  t.ok(array64 instanceof Float32Array, 'returns correct type');
  t.is(array64.length, 8, 'returns correct length');
  t.ok(equals(fromDoublePrecisionArray(array64, 2), array.slice(4, 8)), 'array reconstructs ok');

  t.end();
});
