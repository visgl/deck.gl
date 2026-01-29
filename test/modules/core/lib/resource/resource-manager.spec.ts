// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global setTimeout */
import {test, expect} from 'vitest';
import {device} from '@deck.gl/test-utils';
import ResourceManager from '@deck.gl/core/lib/resource/resource-manager';

test('ResourceManager#protocol', () => {
  let dataManager = new ResourceManager({device, onError: err => expect(err).toBeFalsy()});
  expect(dataManager.contains('resource://data-01'), 'checks protocol').toBeTruthy();
  expect(dataManager.contains('deck://data-01'), 'checks protocol').toBeFalsy();

  dataManager = new ResourceManager({
    device,
    protocol: 'deck://',
    onError: err => expect(err).toBeFalsy()
  });
  expect(dataManager.contains('resource://data-01'), 'checks protocol').toBeFalsy();
  expect(dataManager.contains('deck://data-01'), 'checks protocol').toBeTruthy();
});

test('ResourceManager#add,remove', () => {
  const dataManager = new ResourceManager({device, onError: err => expect(err).toBeFalsy()});

  expect(dataManager.contains('data-01'), 'does not contain resource').toBeFalsy();

  let value = [{x: 0, y: 0}];
  dataManager.add({resourceId: 'data-01', data: value});
  expect(dataManager.contains('data-01'), 'resource is added').toBeTruthy();
  expect(dataManager._resources['data-01'].getData()).toBe(value);

  value = [{x: 1, y: 1}];
  dataManager.add({resourceId: 'data-01', data: value});
  expect(dataManager.contains('data-01'), 'resource is added').toBeTruthy();
  expect(dataManager._resources['data-01'].getData(), 'resource is updated').toBe(value);

  dataManager.remove('data-01');
  expect(dataManager.contains('data-01'), 'resource is removed').toBeFalsy();

  expect(() => dataManager.remove('data-02'), 'remove non-existent resource').not.toThrow();

  dataManager.finalize();
});

// eslint-disable-next-line
test('ResourceManager#subscribe, unsubscribe', () => {
  const dataManager = new ResourceManager({device, onError: err => expect(err).toBeFalsy()});
  let propA1Changed = 0;
  let propA2Changed = 0;
  let propBChanged = 0;

  expect(
    () => dataManager.unsubscribe({consumerId: 'Layer2'}),
    'unsubscribe non-existent consumer'
  ).not.toThrow();

  expect(
    dataManager.subscribe({
      resourceId: 'data-01',
      onChange: () => propA1Changed++,
      consumerId: 'Layer1',
      requestId: 'propA1'
    }),
    'subscribing non-existent non-protocol resource'
  ).toBe(undefined);
  expect(
    dataManager.subscribe({
      resourceId: 'resource://data-01',
      onChange: () => propA1Changed++,
      consumerId: 'Layer1',
      requestId: 'propA1'
    }),
    'subscribing non-existent protocol resource'
  ).toBe(null);
  expect(
    propA1Changed === 0 && propA2Changed === 0 && propBChanged === 0,
    'callback has not been called'
  ).toBeTruthy();

  const data1 = [{x: 0, y: 0}];
  let data2 = ['a', 'b', 'c'];
  dataManager.add({resourceId: 'data-01', data: data1, persistent: false});
  dataManager.add({resourceId: 'data-02', data: data2, persistent: true});

  expect(
    dataManager.subscribe({
      resourceId: 'resource://data-01',
      onChange: () => propA2Changed++,
      consumerId: 'Layer2',
      requestId: 'propA2'
    })
  ).toBe(data1);
  expect(
    dataManager.subscribe({
      resourceId: 'resource://data-02',
      onChange: () => propBChanged++,
      consumerId: 'Layer2',
      requestId: 'propB'
    })
  ).toBe(data2);

  expect(
    propA1Changed === 1 && propA2Changed === 0 && propBChanged === 0,
    'Layer1 callback is called'
  ).toBeTruthy();

  dataManager.add({resourceId: 'data-01', data: data1, persistent: false});
  dataManager.add({resourceId: 'data-02', data: data2, persistent: true});

  expect(
    propA1Changed === 1 && propA2Changed === 0 && propBChanged === 0,
    'data did not change'
  ).toBeTruthy();

  dataManager.add({resourceId: 'data-01', data: data1, persistent: false, forceUpdate: true});
  expect(
    propA1Changed === 2 && propA2Changed === 1 && propBChanged === 0,
    'data-01 changed'
  ).toBeTruthy();

  data2 = ['a', 'b'];
  dataManager.add({resourceId: 'data-02', data: data2, persistent: true});
  expect(
    propA1Changed === 2 && propA2Changed === 1 && propBChanged === 1,
    'data-02 changed'
  ).toBeTruthy();

  expect(
    dataManager.subscribe({
      resourceId: 'resource://data-01',
      onChange: () => propBChanged++,
      consumerId: 'Layer2',
      requestId: 'propB'
    })
  ).toBe(data1);
  data2 = ['a'];
  dataManager.add({resourceId: 'data-02', data: data2, persistent: true});
  expect(
    propA1Changed === 2 && propA2Changed === 1 && propBChanged === 1,
    'data-02 no longer listened to'
  ).toBeTruthy();

  dataManager.add({resourceId: 'data-01', data: data1, persistent: false, forceUpdate: true});
  expect(
    propA1Changed === 3 && propA2Changed === 2 && propBChanged === 2,
    'data-01 changed'
  ).toBeTruthy();

  expect(
    dataManager.subscribe({
      resourceId: 'http://data.json',
      onChange: () => propBChanged++,
      consumerId: 'Layer2',
      requestId: 'propB'
    })
  ).toBe(undefined);
  dataManager.add({resourceId: 'data-01', data: data1, persistent: false, forceUpdate: true});
  expect(
    propA1Changed === 4 && propA2Changed === 3 && propBChanged === 2,
    'data-01 changed'
  ).toBeTruthy();

  dataManager.unsubscribe({consumerId: 'Layer2'});

  dataManager.add({resourceId: 'data-01', data: data1, persistent: false, forceUpdate: true});
  expect(
    propA1Changed === 5 && propA2Changed === 3 && propBChanged === 2,
    'Layer2 callbacks are no longer called'
  ).toBeTruthy();

  data2 = ['a'];
  dataManager.add({resourceId: 'data-02', data: data2, persistent: true});
  expect(
    propA1Changed === 5 && propA2Changed === 3 && propBChanged === 2,
    'Layer2 callbacks are no longer called'
  ).toBeTruthy();

  dataManager.unsubscribe({consumerId: 'Layer1'});
  setTimeout(() => {
    expect(dataManager.contains('data-01'), 'non-persistent resource is pruned').toBeFalsy();
    expect(dataManager.contains('data-02'), 'persistent resource is not pruned').toBeTruthy();

    dataManager.finalize();
  }, 100);
});
