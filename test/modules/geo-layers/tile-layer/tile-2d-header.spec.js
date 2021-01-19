import test from 'tape-catch';
import Tile2DHeader from '@deck.gl/geo-layers/tile-layer/tile-2d-header';
import {RequestScheduler} from '@loaders.gl/loader-utils';
import {WebMercatorViewport} from '@deck.gl/core';
import {transformTileCoordsToWGS84} from '@deck.gl/geo-layers/mvt-layer/mvt-layer';

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

test('Tile2DHeader#Abort quickly', async t => {
  const requestScheduler = new RequestScheduler({throttleRequests: true, maxRequests: 1});

  const getTileData = () => null;
  const onTileLoad = () => null;
  const onTileError = () => null;

  const tile = new Tile2DHeader({onTileLoad, onTileError});
  tile.isSelected = true;

  // Await later so that the abort could go off before the getTileData call.
  const loader = tile._loadData(getTileData, requestScheduler);
  tile.abort();
  await loader;

  t.notOk(requestScheduler.requestMap.has(tile), 'Scheduler deletes tile on abort');
  t.end();
});

const LOCAL_TILE_COORDS = [
  {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [0.80908203125, 0.8935546875],
          [0.8095703125, 0.89404296875],
          [0.80908203125, 0.89404296875],
          [0.80908203125, 0.8935546875]
        ]
      ]
    }
  }
];

test('Tile2DHeader#dataInWorldCoordinates', async t => {
  const [loader, tile] = createTile2DHeaderWithMockedData(LOCAL_TILE_COORDS);

  t.notOk(tile.isLoaded, 'Data has not been loaded yet');
  t.deepEqual(await tile.dataInWorldCoordinates, await loader);
  t.ok(tile.isLoaded, 'Data has been loaded');
  t.deepEqual(
    await tile.dataInWorldCoordinates,
    tile.content,
    'Correctly returns no-transformed data'
  );

  t.end();
});

const TRANSFORM_TO_WORLD_VIEWPORT = new WebMercatorViewport({
  latitude: 0,
  longitude: 0,
  zoom: 1
});

const TRANSFORM_TO_WORLD_BBOX = {west: -180, north: 85.0511287798066, east: 0, south: 0};

test('Tile2DHeader#transformToWorld', async t => {
  const [loader, tile] = createTile2DHeaderWithMockedData(LOCAL_TILE_COORDS);

  tile.bbox = TRANSFORM_TO_WORLD_BBOX;
  tile.transformToWorld = ([object]) =>
    transformTileCoordsToWGS84(object, tile, TRANSFORM_TO_WORLD_VIEWPORT);

  t.notOk(tile.isLoaded, 'Data has not been loaded yet');
  t.deepEqual(await tile.dataInWorldCoordinates, await loader);
  t.is(tile._transformToWorldDataCache, null, 'Data cache is empty');
  t.ok(tile.isLoaded, 'Data has been loaded');
  t.deepEqual(
    await tile.dataInWorldCoordinates,
    tile._transformToWorldDataCache,
    'Correctly returns transformed data'
  );

  t.end();
});

function createTile2DHeaderWithMockedData(data) {
  const requestScheduler = new RequestScheduler({throttleRequests: true, maxRequests: 1});

  const getTileData = () => Promise.resolve(data);
  const onTileLoad = () => null;
  const onTileError = () => null;

  const tile = new Tile2DHeader({onTileLoad, onTileError});
  tile.isSelected = true;

  const loader = tile._loadData(getTileData, requestScheduler);

  return [loader, tile];
}
