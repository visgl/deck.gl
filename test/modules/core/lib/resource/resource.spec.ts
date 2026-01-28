// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global setTimeout */
import {test, expect, describe} from 'vitest';
import {device} from '@deck.gl/test-utils';
import Resource from '@deck.gl/core/lib/resource/resource';

function mockLoadData(value, delay) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(value);
    }, delay);
  });
}

test('Resource#setData', async () => {
  const resource = new Resource('test', [], {device});
  expect(resource.getData()).toEqual([]);

  resource.setData('./test.json');
  const testData = resource.getData();
  expect(testData instanceof Promise, 'data is being loaded').toBeTruthy();
  let errors = 0;
  try {
    await testData;
  } catch (e) {
    errors++;
  }
  expect(errors, 'Load error is caught').toBe(1);

  // When this promise is resolved, data should have been overwritten
  resource.setData(mockLoadData('A', 100));
  const dataA = resource.getData();

  // When this promise is rejected, data should have been overwritten
  resource.setData(Promise.reject());
  const dataReject = resource.getData();

  resource.setData(mockLoadData('B', 50));
  const dataB = resource.getData();

  expect(await dataA, 'promise A is overwritten').toBe('B');
  expect(await dataReject, 'failing promise is overwritten').toBe('B');
  expect(await dataB, 'promise B is current').toBe('B');
  expect(resource.getData()).toBe('B');

  resource.delete();
});
