import test from 'tape-catch';
import TileCache, {
  STRATEGY_EXCLUSIVE,
  STRATEGY_DEFAULT
} from '@deck.gl/layers/base-tile-layer/utils/tile-cache';
import Tile from '@deck.gl/layers/base-tile-layer/utils/tile';
import {tileToBoundingBox} from '@deck.gl/geo-layers/tile-layer/utils/tile-util';
import {getTileIndices} from '@deck.gl/geo-layers/tile-layer/utils/viewport-util';
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
const testTile = new Tile({x: 1171, y: 1566, z: 12, tileToBoundingBox});

const testViewport = new WebMercatorViewport(testViewState);

const cacheMaxSize = 1;
const maxZoom = 13;
const minZoom = 11;

const getTileData = () => Promise.resolve(null);
const testTileCacheProps = {
  getTileData,
  tileToBoundingBox,
  getTileIndices,
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
    tileToBoundingBox,
    getTileIndices,
    maxSize: cacheMaxSize,
    minZoom,
    maxZoom
  });

  errorTileCache.update(testViewport);
});

test('TileCache#traversal', t => {
  const tileCache = new TileCache({
    tileToBoundingBox,
    getTileIndices,
    getTileData: () => sleep(10),
    onTileLoad: () => {},
    onTileError: () => {}
  });

  /*
    Test tiles:
                                        +- 2-0-0 (pending) -+- 3-0-0 (pending) -+- 4-0-0 (pending)
                                        +- 2-0-1 (pending) -+- 3-0-2 (loaded)  -+- 4-0-4 (pending)
                    +- 1-0-0 (loaded)  -+- 2-1-0 (missing) -+- 3-2-0 (pending)
                    |                   +- 2-1-1 (missing) -+- 3-2-2 (loaded)
   0-0-0 (pending) -+
                    |                   +- 2-2-0 (loaded)  -+- 3-4-0 (pending)
                    +- 1-1-0 (pending) -+- 2-2-1 (loaded)  -+- 3-4-2 (loaded)
                                        +- 2-3-0 (pending) -+- 3-6-0 (pending)
                                        +- 2-3-1 (pending) -+- 3-6-2 (loaded)
   */
  const TEST_CASES = [
    {
      selectedTiles: ['0-0-0'],
      visibleTiles: ['1-0-0', '2-2-0', '2-2-1', '3-6-2']
    },
    {
      selectedTiles: ['1-0-0'],
      visibleTiles: ['1-0-0']
    },
    {
      selectedTiles: ['1-0-0', '1-1-0'],
      visibleTiles: ['1-0-0', '2-2-0', '2-2-1', '3-6-2']
    },
    {
      selectedTiles: ['2-0-0', '2-0-1'],
      visibleTiles: ['1-0-0']
    },
    {
      selectedTiles: ['2-2-0', '2-2-1', '2-3-0', '2-3-1'],
      visibleTiles: ['2-2-0', '2-2-1', '3-6-2']
    },
    {
      selectedTiles: ['3-0-0', '3-2-0'],
      visibleTiles: ['1-0-0']
    },
    {
      selectedTiles: ['3-0-0', '3-0-2', '3-2-0', '3-2-2'],
      visibleTiles: {
        [STRATEGY_DEFAULT]: ['1-0-0', '3-0-2', '3-2-2'],
        [STRATEGY_EXCLUSIVE]: ['3-0-2', '3-2-2']
      }
    },
    {
      selectedTiles: ['3-4-0', '3-6-0'],
      visibleTiles: ['2-2-0']
    },
    {
      selectedTiles: ['3-4-0', '3-4-2', '3-6-0', '3-6-2'],
      visibleTiles: ['2-2-0', '3-4-2', '3-6-2']
    },
    {
      selectedTiles: ['4-0-0', '4-0-4'],
      visibleTiles: {
        [STRATEGY_DEFAULT]: ['1-0-0', '3-0-2'],
        [STRATEGY_EXCLUSIVE]: ['3-0-2']
      }
    }
  ];

  const tileMap = tileCache._cache;
  const strategies = [STRATEGY_DEFAULT, STRATEGY_EXCLUSIVE];

  const validateVisibility = visibleTiles => {
    let allMatched = true;
    for (const [tileId, tile] of tileMap) {
      const expected = visibleTiles.includes(tileId);
      const actual = Boolean(tile.state & 1) && tile.isLoaded;
      if (expected !== actual) {
        t.fail(
          `Tile ${tileId} has state ${tile.state}, expected ${expected ? 'visible' : 'invisible'}`
        );
        allMatched = false;
      }
    }
    t.ok(allMatched, 'Tile visibility updated correctly');
  };

  // Tiles that should be loaded
  tileCache._getTile(0, 0, 1, true);
  tileCache._getTile(2, 0, 2, true);
  tileCache._getTile(2, 1, 2, true);
  tileCache._getTile(0, 2, 3, true);
  tileCache._getTile(2, 2, 3, true);
  tileCache._getTile(4, 2, 3, true);
  tileCache._getTile(6, 2, 3, true);

  sleep(100).then(() => {
    // Tiles that should be pending
    tileCache._getTile(0, 0, 0, true);
    tileCache._getTile(1, 0, 1, true);
    tileCache._getTile(0, 0, 2, true);
    tileCache._getTile(0, 1, 2, true);
    tileCache._getTile(3, 0, 2, true);
    tileCache._getTile(3, 1, 2, true);
    tileCache._getTile(0, 0, 3, true);
    tileCache._getTile(2, 0, 3, true);
    tileCache._getTile(4, 0, 3, true);
    tileCache._getTile(6, 0, 3, true);
    tileCache._getTile(0, 0, 4, true);
    tileCache._getTile(0, 4, 4, true);

    tileCache._rebuildTree();

    for (const testCase of TEST_CASES) {
      const selectedTiles = testCase.selectedTiles.map(id => tileMap.get(id));

      for (const strategy of strategies) {
        tileCache._strategy = strategy;
        tileCache._updateTileStates(selectedTiles);
        validateVisibility(testCase.visibleTiles[strategy] || testCase.visibleTiles);
      }
    }

    t.end();
  });
});

function sleep(ms) {
  return new Promise(resolve => {
    /* global setTimeout */
    setTimeout(resolve, ms);
  });
}
