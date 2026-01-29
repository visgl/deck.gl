// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {_Tile2DHeader as Tile2DHeader} from '@deck.gl/geo-layers';
import {RequestScheduler} from '@loaders.gl/loader-utils';

test('Tile2DHeader', async () => {
  let onTileLoadCalled = false;
  let onTileErrorCalled = false;
  const requestScheduler = new RequestScheduler({throttleRequests: false});

  let tile2d = new Tile2DHeader({});
  await tile2d.loadData({
    requestScheduler,
    getData: () => 'loaded data',
    onLoad: () => (onTileLoadCalled = true),
    onError: () => (onTileErrorCalled = true)
  });

  expect(tile2d.isLoaded, 'Tile is loaded').toBeTruthy();
  expect(onTileLoadCalled, 'invoked onLoad callback').toBeTruthy();
  expect(tile2d.data, 'data field is populated').toBe('loaded data');

  tile2d = new Tile2DHeader({});
  await tile2d.loadData({
    requestScheduler,
    getData: () => {
      throw new Error('getTileData error');
    },
    onLoad: () => (onTileLoadCalled = true),
    onError: () => (onTileErrorCalled = true)
  });
  expect(tile2d.isLoaded, 'Tile is loaded').toBeTruthy();
  expect(onTileErrorCalled, 'invoked onError callback').toBeTruthy();
});

test('Tile2DHeader#Cancel request if not selected', async () => {
  let tileRequestCount = 0;
  let onTileLoadCalled = 0;
  let onTileErrorCalled = 0;

  const requestScheduler = new RequestScheduler({throttleRequests: true, maxRequests: 1});
  const opts = {
    requestScheduler,
    getData: () => tileRequestCount++,
    onLoad: () => onTileLoadCalled++,
    onError: () => onTileErrorCalled++
  };

  const tile1 = new Tile2DHeader({});
  const tile2 = new Tile2DHeader({});
  tile1.isSelected = true;
  tile2.isSelected = false;

  // Await later so that request scheduler has both queued at the same time
  const loader1 = tile1.loadData(opts);
  const loader2 = tile2.loadData(opts);
  await loader1;
  await loader2;

  expect(tileRequestCount, 'One successful request').toBe(1);
  expect(tile1._isCancelled, 'First request was not cancelled').toBeFalsy();
  expect(tile2._isCancelled, 'Second request was cancelled').toBeTruthy();
  expect(onTileLoadCalled === 1 && onTileErrorCalled === 0, 'Callbacks invoked').toBeTruthy();
});

test('Tile2DHeader#abort', async () => {
  const requestScheduler = new RequestScheduler({throttleRequests: true, maxRequests: 1});
  let onTileLoadCalled = false;
  let onTileErrorCalled = false;

  const opts = {
    requestScheduler,
    getData: () => null,
    onLoad: () => (onTileLoadCalled = true),
    onError: () => (onTileErrorCalled = true)
  };
  const tile = new Tile2DHeader({});
  tile.isSelected = true;

  // Await later so that the abort could go off before the getTileData call.
  const loader = tile.loadData(opts);
  tile.abort();
  await loader;

  expect(onTileErrorCalled || onTileLoadCalled, 'Callbacks should not be invoked').toBeFalsy();
  expect(requestScheduler.requestMap.has(tile), 'Scheduler deletes tile on abort').toBeFalsy();
});

test('Tile2DHeader#reload', async () => {
  const requestScheduler = new RequestScheduler({throttleRequests: true, maxRequests: 2});
  const getTileData = (result, delay) =>
    new Promise(resolve => {
      /* global setTimeout */
      setTimeout(() => {
        console.log(`Loaded ${result}`);
        resolve(result);
      }, delay);
    });

  let onTileLoadCalled = 0;
  let onTileErrorCalled = 0;
  const opts = {
    requestScheduler,
    onLoad: () => onTileLoadCalled++,
    onError: () => onTileErrorCalled++
  };

  const tile = new Tile2DHeader({});
  tile.isSelected = true;

  await tile.loadData({...opts, getData: () => getTileData('a', 0)});
  expect(tile.data, 'initial load').toBe('a');

  tile.setNeedsReload();
  await tile.loadData({...opts, getData: () => getTileData('b', 0)});
  expect(tile.data, 'reloaded').toBe('b');

  // Reload before a load is finished
  const loaderc1 = tile.loadData({...opts, getData: () => getTileData('c1', 0)});
  tile.loadData({...opts, getData: () => getTileData('c2', 10)});
  await loaderc1;
  expect(tile.content, 'outdated result is discarded').toBe('b');
  expect(await tile.data, 'loaded the result of the last request').toBe('c2');

  // Multiple load requests resolved out of order
  tile.loadData({...opts, getData: () => getTileData('d1', 50)});
  tile.loadData({...opts, getData: () => getTileData('d2', 0)});
  expect(await tile.data, 'loaded the result of the last request').toBe('d2');
});
