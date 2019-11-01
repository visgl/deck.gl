import test from 'tape-catch';
import TileCache from '@deck.gl/geo-layers/tile-layer/utils/tile-cache';
import Tile from '@deck.gl/geo-layers/tile-layer/utils/tile';
import {WebMercatorViewport} from '@deck.gl/core';

const testViewState = {
  bearing: 0,
  pitch: 0,
  longitude: -77.06753216318891,
  latitude: 38.94628276371387,
  zoom: 12,
  minZoom: 2,
  maxZoom: 14,
  height: 1,
  width: 1
};

// testViewState should load tile 12-1171-1566
const testTile = new Tile({x: 1171, y: 1566, z: 12});

const testViewport = new WebMercatorViewport(testViewState);

const cacheMaxSize = 1;
const maxZoom = 13;
const minZoom = 11;

const getTileData = () => Promise.resolve(null);
const testTileCacheProps = {
  getTileData,
  maxSize: cacheMaxSize,
  minZoom,
  maxZoom,
  onTileLoad: () => {}
};

test('TileCache#TileCache#should clear the cache when finalize is called', t => {
  const tileCache = new TileCache(testTileCacheProps);
  tileCache.update(testViewport);
  t.equal(tileCache._cache.size, 1);
  tileCache.finalize();
  t.equal(tileCache._cache.size, 0);
  t.end();
});

test('TileCache#should call onUpdate with the expected tiles', t => {
  const tileCache = new TileCache(testTileCacheProps);
  tileCache.update(testViewport);

  t.equal(tileCache.tiles[0].x, testTile.x);
  t.equal(tileCache.tiles[0].y, testTile.y);
  t.equal(tileCache.tiles[0].z, testTile.z);

  tileCache.finalize();
  t.end();
});

test('TileCache#should clear not visible tiles when cache is full', t => {
  const tileCache = new TileCache(testTileCacheProps);
  // load a viewport to fill the cache
  tileCache.update(testViewport);
  // load another viewport. The previous cached tiles shouldn't be visible
  tileCache.update(
    new WebMercatorViewport(
      Object.assign({}, testViewState, {
        longitude: -100,
        latitude: 80
      })
    )
  );

  t.equal(tileCache._cache.size, 1);
  t.ok(tileCache._cache.get('12-910-459'), 'expected tile is in cache');

  tileCache.finalize();
  t.end();
});

test('TileCache#should load the cached parent tiles while we are loading the current tiles', t => {
  const tileCache = new TileCache(testTileCacheProps);
  tileCache.update(testViewport);

  const zoomedInViewport = new WebMercatorViewport(
    Object.assign({}, testViewState, {
      zoom: maxZoom
    })
  );
  tileCache.update(zoomedInViewport);
  t.ok(
    tileCache.tiles.some(
      tile => tile.x === testTile.x && tile.y === testTile.y && tile.z === testTile.z
    ),
    'loads cached parent tiles'
  );

  tileCache.finalize();
  t.end();
});

test('TileCache#should try to load the existing zoom levels if we zoom in too far', t => {
  const tileCache = new TileCache(testTileCacheProps);
  const zoomedInViewport = new WebMercatorViewport(
    Object.assign({}, testViewState, {
      zoom: 20
    })
  );

  tileCache.update(zoomedInViewport);
  tileCache.tiles.forEach(tile => {
    t.equal(tile.z, maxZoom);
  });

  tileCache.finalize();
  t.end();
});

test('TileCache#should not display anything if we zoom out too far', t => {
  const tileCache = new TileCache(testTileCacheProps);
  const zoomedOutViewport = new WebMercatorViewport(
    Object.assign({}, testViewState, {
      zoom: 1
    })
  );

  tileCache.update(zoomedOutViewport);
  t.equal(tileCache.tiles.length, 0);
  tileCache.finalize();
  t.end();
});

test('TileCache#should set isLoaded to true even when loading the tile throws an error', t => {
  const errorTileCache = new TileCache({
    getTileData: () => Promise.reject(null),
    onTileError: () => {
      t.equal(errorTileCache.tiles[0].isLoaded, true);
      errorTileCache.finalize();
      t.end();
    },
    maxSize: cacheMaxSize,
    minZoom,
    maxZoom
  });

  errorTileCache.update(testViewport);
});
