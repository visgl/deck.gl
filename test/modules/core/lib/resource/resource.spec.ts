/* global setTimeout */
import test from 'tape-promise/tape';
import {device} from '@deck.gl/test-utils';
import Resource from '@deck.gl/core/lib/resource/resource';

function mockLoadData(value, delay) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(value);
    }, delay);
  });
}

test('Resource#setData', async t => {
  const resource = new Resource('test', [], {device});
  t.deepEqual(resource.getData(), []);

  resource.setData('./test.json');
  const testData = resource.getData();
  t.ok(testData instanceof Promise, 'data is being loaded');
  let errors = 0;
  try {
    await testData;
  } catch (e) {
    errors++;
  }
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

  resource.delete();
  t.end();
});
