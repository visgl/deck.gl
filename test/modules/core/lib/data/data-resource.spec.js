/* global setTimeout */
import test from 'tape-catch';
import {gl} from '@deck.gl/test-utils';
import DataResource from '@deck.gl/core/lib/data/data-resource';

function mockLoadData(value, delay) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(value);
    }, delay);
  });
}

test('DataResource#setData', async t => {
  let errors = 0;

  const resource = new DataResource('test', [], {gl, onError: () => errors++});
  t.deepEqual(resource.getData(), []);
  t.is(errors, 0, 'No errors');

  resource.setData('./test.json');
  t.ok(resource.getData() instanceof Promise, 'data is being loaded');
  t.is(await resource.getData(), null);
  t.is(errors, 1, 'Load error is caught');

  // When this promise is resolved, data should have been overwritten
  resource.setData(mockLoadData('A', 100));
  const dataA = resource.getData();

  // When this promise is rejected, data should have been overwritten
  resource.setData(Promise.reject());
  const dataReject = resource.getData();

  resource.setData(mockLoadData('B', 50));
  const dataB = resource.getData();

  t.is(await dataA, 'B', 'promise A is overwritten');
  t.is(await dataReject, 'B', 'failing promise is overwritten');
  t.is(await dataB, 'B', 'promise B is current');
  t.is(resource.getData(), 'B');
  t.is(errors, 2, 'Load error is caught');

  resource.delete();
  t.end();
});
