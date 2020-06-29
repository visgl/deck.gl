import test from 'tape-catch';
import Tile2DHeader from '@deck.gl/geo-layers/tile-layer/tile-2d-header';
import {RequestScheduler} from '@loaders.gl/loader-utils';

test('Tile2DHeader', async t => {
  let onTileErrorCalled = false;

  const requestScheduler = new RequestScheduler({throttleRequests: false});
  const getTileData = () => {
    throw new Error('getTileData with error');
  };

  const tile2d = new Tile2DHeader({
    onTileError: () => {
      onTileErrorCalled = true;
    }
  });
  await tile2d._loadData(getTileData, requestScheduler);

  t.ok(tile2d.isLoaded, 'Tile is loaded');
  t.ok(onTileErrorCalled, 'onTileError called');
  t.end();
});

test('Tile2DHeader#Cancel request if not selected', async t => {
  let tileRequestCount = 0;

  const requestScheduler = new RequestScheduler({throttleRequests: true, maxRequests: 1});
  const getTileData = () => tileRequestCount++;
  const onTileLoad = () => null;
  const onTileError = () => null;

  const tile1 = new Tile2DHeader({onTileLoad, onTileError});
  const tile2 = new Tile2DHeader({onTileLoad, onTileError});
  tile1.isSelected = true;
  tile2.isSelected = false;

  // Await later so that request scheduler has both queued at the same time
  const loader1 = tile1._loadData(getTileData, requestScheduler);
  const loader2 = tile2._loadData(getTileData, requestScheduler);
  await loader1;
  await loader2;

  t.equals(tileRequestCount, 1, 'One successful request');
  t.notOk(tile1.isCancelled, 'First request was not cancelled');
  t.ok(tile2.isCancelled, 'Second request was cancelled');
  t.end();
});
