import test from 'tape-promise/tape';
import {_Tile2DHeader as Tile2DHeader} from '@deck.gl/geo-layers';
import {RequestScheduler} from '@loaders.gl/loader-utils';

test('Tile2DHeader', async t => {
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

  t.ok(tile2d.isLoaded, 'Tile is loaded');
  t.ok(onTileLoadCalled, 'invoked onLoad callback');
  t.is(tile2d.data, 'loaded data', 'data field is populated');

  tile2d = new Tile2DHeader({});
  await tile2d.loadData({
    requestScheduler,
    getData: () => {
      throw new Error('getTileData error');
    },
    onLoad: () => (onTileLoadCalled = true),
    onError: () => (onTileErrorCalled = true)
  });
  t.ok(tile2d.isLoaded, 'Tile is loaded');
  t.ok(onTileErrorCalled, 'invoked onError callback');

  t.end();
});

test('Tile2DHeader#Cancel request if not selected', async t => {
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

  t.equals(tileRequestCount, 1, 'One successful request');
  t.notOk(tile1._isCancelled, 'First request was not cancelled');
  t.ok(tile2._isCancelled, 'Second request was cancelled');
  t.ok(onTileLoadCalled === 1 && onTileErrorCalled === 0, 'Callbacks invoked');
  t.end();
});

test('Tile2DHeader#abort', async t => {
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

  t.notOk(onTileErrorCalled || onTileLoadCalled, 'Callbacks should not be invoked');
  t.notOk(requestScheduler.requestMap.has(tile), 'Scheduler deletes tile on abort');
  t.end();
});

test('Tile2DHeader#reload', async t => {
  const requestScheduler = new RequestScheduler({throttleRequests: true, maxRequests: 2});
  const getTileData = (result, delay) =>
    new Promise(resolve => {
      /* global setTimeout */
      setTimeout(() => {
        t.comment(`Loaded ${result}`);
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
  t.is(tile.data, 'a', 'initial load');

  tile.setNeedsReload();
  await tile.loadData({...opts, getData: () => getTileData('b', 0)});
  t.is(tile.data, 'b', 'reloaded');

  // Reload before a load is finished
  const loaderc1 = tile.loadData({...opts, getData: () => getTileData('c1', 0)});
  tile.loadData({...opts, getData: () => getTileData('c2', 10)});
  await loaderc1;
  t.is(tile.content, 'b', 'outdated result is discarded');
  t.is(await tile.data, 'c2', 'loaded the result of the last request');

  // Multiple load requests resolved out of order
  tile.loadData({...opts, getData: () => getTileData('d1', 50)});
  tile.loadData({...opts, getData: () => getTileData('d2', 0)});
  t.is(await tile.data, 'd2', 'loaded the result of the last request');

  t.end();
});
