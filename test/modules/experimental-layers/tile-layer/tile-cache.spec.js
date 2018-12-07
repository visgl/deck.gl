import test from 'tape-catch';
import TileCache from '@deck.gl/experimental-layers/tile-layer/utils/tile-cache';
import Tile from '@deck.gl/experimental-layers/tile-layer/utils/tile';
import {WebMercatorViewport} from 'deck.gl';

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
const testTileCache = new TileCache({
  getTileData,
  maxSize: cacheMaxSize,
  minZoom,
  maxZoom
});

test('should clear the cache when finalize is called', t => {
  testTileCache.update(testViewport, () => null);
  t.equal(testTileCache._cache.size, 1);
  testTileCache.finalize();
  t.equal(testTileCache._cache.size, 0);
  t.end();
});

test('should call onUpdate with the expected tiles', t => {
  testTileCache.update(testViewport, tiles => {
    t.equal(tiles.length, 1);
    t.equal(tiles[0].x, testTile.x);
    t.equal(tiles[0].y, testTile.y);
    t.equal(tiles[0].z, testTile.z);
    t.end();
  });
  testTileCache.finalize();
});

test('should clear not visible tiles when cache is full', t => {
  // load a viewport to fill the cache

  testTileCache.update(testViewport, () => null);
  // load another viewport. The previous cached tiles shouldn't be visible
  testTileCache.update(
    new WebMercatorViewport({
      ...testViewState,
      longitude: -100,
      latitude: 80
      // tile is 12-910-2958
    }),
    tiles => {
      t.equal(testTileCache._cache.size, 1);
      const x = 910;
      const y = 459;
      const z = 12;
      const expectedTile = new Tile({x, y, z, getTileData});
      const actualTile = testTileCache._cache.get(`${z}-${x}-${y}`);
      t.equal(actualTile.x, expectedTile.x);
      t.equal(actualTile.y, expectedTile.y);
      t.equal(actualTile.z, expectedTile.z);
      t.end();
    }
  );
  testTileCache.finalize();
});

test('should load the cached parent tiles while we are loading the current tiles', t => {
  testTileCache.update(testViewport, tiles => null);

  const zoomedInViewport = new WebMercatorViewport({
    ...testViewState,
    zoom: maxZoom
  });
  testTileCache.update(zoomedInViewport, tiles => {
    t.true(
      tiles.some(tile => tile.x === testTile.x && tile.y === testTile.y && tile.z === testTile.z)
    );
    t.end();
  });
  testTileCache.finalize();
});

test('should try to load the existing zoom levels if we zoom in too far', t => {
  const zoomedInViewport = new WebMercatorViewport({
    ...testViewState,
    zoom: 20
  });

  testTileCache.update(zoomedInViewport, tiles => {
    tiles.forEach(tile => {
      t.equal(tile.z, maxZoom);
    });
    t.end();
  });
  testTileCache.finalize();
});

test('should not display anything if we zoom out too far', t => {
  const zoomedOutViewport = new WebMercatorViewport({
    ...testViewState,
    zoom: 1
  });

  testTileCache.update(zoomedOutViewport, tiles => {
    t.equal(tiles.length, 0);
    t.end();
  });
  testTileCache.finalize();
});

test('should set isLoaded to true even when loading the tile throws an error', t => {
  const errorTileCache = new TileCache({
    getTileData: () => Promise.reject(null),
    maxSize: cacheMaxSize,
    minZoom,
    maxZoom
  });

  errorTileCache.update(testViewport, tiles => {
    // eslint-disable-next-line
    window.setTimeout(() => {
      t.equal(tiles[0].isLoaded, true);
      t.end();
    });
  });
  errorTileCache.finalize();
});
