import test from 'tape-promise/tape';
import Tileset2D, {
  STRATEGY_REPLACE,
  STRATEGY_DEFAULT,
  STRATEGY_NEVER
} from '@deck.gl/geo-layers/tile-layer/tileset-2d';
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
const testViewport = new WebMercatorViewport(testViewState);

const getTileData = () => Promise.resolve(null);

test('Tileset2D#constructor', t => {
  const tileset = new Tileset2D({
    getTileData,
    minZoom: 11,
    maxZoom: null,
    onTileLoad: () => {}
  });

  t.equal(tileset._minZoom, 11, 'minZoom is set');
  t.notOk(tileset._maxZoom, 'maxZoom is undefined');

  tileset.setOptions({maxZoom: 13});
  t.is(tileset._maxZoom, 13, 'maxZoom is set');

  t.end();
});

test('Tileset2D#update', t => {
  const tileset = new Tileset2D({
    getTileData,
    onTileLoad: () => {}
  });
  tileset.update(testViewport);

  t.is(tileset._cache.size, 1, 'should update with expected tiles');

  t.equal(tileset.tiles[0].x, 1171);
  t.equal(tileset.tiles[0].y, 1566);
  t.equal(tileset.tiles[0].z, 12);
  t.ok(tileset.tiles[0].bbox, 'tile has metadata');

  t.end();
});

test('Tileset2D#finalize', async t => {
  const tileset = new Tileset2D({
    getTileData: () => sleep(50),
    onTileLoad: () => {}
  });
  tileset.update(testViewport);
  const tile1 = tileset.selectedTiles[0];

  await sleep(60);

  tileset.update(
    new WebMercatorViewport(
      Object.assign({}, testViewState, {
        longitude: -100,
        latitude: 80
      })
    )
  );
  const tile2 = tileset.selectedTiles[0];

  tileset.finalize();
  t.notOk(tileset._cache.size, 'cache is purged');

  t.is(
    tile1._isCancelled,
    false,
    'first tile should not have been loading and thus not been aborteed'
  );
  t.is(tile2._isCancelled, true, 'second tile should have been aborted');

  t.end();
});

test('Tileset2D#maxCacheSize', t => {
  const tileset = new Tileset2D({
    getTileData,
    maxCacheSize: 1,
    onTileLoad: () => {},
    onTileUnload: () => {}
  });
  // load a viewport to fill the cache
  tileset.update(testViewport);
  t.equal(tileset._cache.size, 1, 'expected cache size');
  t.ok(tileset._cache.get('1171,1566,12'), 'expected tile is in cache');

  // load another viewport. The previous cached tiles shouldn't be visible
  tileset.update(
    new WebMercatorViewport(
      Object.assign({}, testViewState, {
        longitude: -100,
        latitude: 80
      })
    )
  );

  t.equal(tileset._cache.size, 1, 'cache is resized');
  t.ok(tileset._cache.get('910,459,12'), 'expected tile is in cache');

  t.end();
});

test('Tileset2D#maxCacheByteSize', async t => {
  const tileset = new Tileset2D({
    getTileData: () => Promise.resolve({byteLength: 100}),
    maxCacheByteSize: 150,
    onTileLoad: () => {},
    onTileUnload: () => {}
  });
  // load a viewport to fill the cache
  tileset.update(testViewport);
  t.equal(tileset._cache.size, 1, 'expected cache size');
  t.ok(tileset._cache.get('1171,1566,12'), 'expected tile is in cache');

  // load another viewport. The previous cached tiles shouldn't be visible
  tileset.update(
    new WebMercatorViewport(
      Object.assign({}, testViewState, {
        longitude: -100,
        latitude: 80
      })
    )
  );

  t.equal(tileset._cache.size, 2, 'new tile added to cache');

  await sleep(100);

  t.equal(tileset._cache.size, 1, 'cache is resized after tile data is loaded');
  t.ok(tileset._cache.get('910,459,12'), 'expected tile is in cache');

  t.end();
});

test('Tileset2D#over-zoomed', t => {
  const tileset = new Tileset2D({
    getTileData,
    minZoom: 11,
    maxZoom: 13,
    onTileLoad: () => {}
  });
  const zoomedInViewport = new WebMercatorViewport(
    Object.assign({}, testViewState, {
      zoom: 20
    })
  );

  tileset.update(zoomedInViewport);
  tileset.tiles.forEach(tile => {
    t.equal(tile.z, 13);
  });

  t.end();
});

test('Tileset2D#under-zoomed', t => {
  const tileset = new Tileset2D({
    getTileData,
    minZoom: 11,
    maxZoom: 13,
    onTileLoad: () => {}
  });
  const zoomedOutViewport = new WebMercatorViewport(Object.assign({}, testViewState, {zoom: 1}));

  tileset.update(zoomedOutViewport);
  t.equal(tileset.tiles.length, 0);
  t.end();
});

test('Tileset2D#under-zoomed-with-extent', t => {
  const tileset = new Tileset2D({
    getTileData,
    minZoom: 11,
    maxZoom: 13,
    extent: [-180, -85.05113, 180, 85.05113],
    onTileLoad: () => {}
  });
  const zoomedOutViewport = new WebMercatorViewport(Object.assign({}, testViewState, {zoom: 1}));

  tileset.update(zoomedOutViewport);
  const tileZoomLevels = tileset.tiles.map(tile => tile.z);
  t.assert(tileZoomLevels[0] === 11);
  t.end();
});

test('Tileset2D#callbacks', async t => {
  let tileLoadCalled = 0;
  let tileErrorCalled = 0;
  let tileUnloadCalled = 0;

  const tileset = new Tileset2D({
    maxCacheSize: 1,
    getTileData: () => Promise.resolve(null),
    onTileLoad: () => tileLoadCalled++,
    onTileError: () => tileErrorCalled++,
    onTileUnload: () => tileUnloadCalled++
  });
  tileset.update(testViewport);
  t.notOk(tileset.isLoaded, 'should be loading');

  await sleep(100);

  t.ok(tileset.isLoaded, 'tileset is loaded');
  t.is(tileLoadCalled, 1, 'onTileLoad is called');
  t.is(tileErrorCalled, 0, 'onTileError is not called');

  tileLoadCalled = 0;
  tileErrorCalled = 0;

  const errorTileset = new Tileset2D({
    getTileData: () => Promise.reject(null),
    onTileLoad: () => tileLoadCalled++,
    onTileError: () => tileErrorCalled++
  });

  errorTileset.update(testViewport);
  t.notOk(errorTileset.isLoaded, 'should be loading');

  await sleep(100);

  t.ok(errorTileset.isLoaded, 'tileset is loaded');
  t.is(tileLoadCalled, 0, 'onTileLoad is not called');
  t.is(tileErrorCalled, 1, 'onTileError is called');

  t.is(tileUnloadCalled, 0, 'onTileUnload is not called');
  // load another viewport. The previous cached tiles shouldn't be visible
  tileset.update(
    new WebMercatorViewport(
      Object.assign({}, testViewState, {
        longitude: -100,
        latitude: 80
      })
    )
  );
  t.is(tileUnloadCalled, 1, 'onTileUnload is called');

  t.end();
});

/* eslint-disable max-statements, complexity, max-depth */
test('Tileset2D#traversal', async t => {
  const tileset = new Tileset2D({
    getTileData: () => sleep(10),
    onTileLoad: () => {},
    onTileError: () => {}
  });

  /*
    Test tiles:
                                        +- 0,0,2 (pending) -+- 0,0,3 (pending) -+- 0,0,4 (pending)
                                        +- 0,1,2 (pending) -+- 0,2,3 (loaded)  -+- 0,4,4 (pending)
                    +- 0,0,1 (loaded)  -+- 1,0,2 (missing) -+- 2,0,3 (pending)
                    |                   +- 1,1,2 (missing) -+- 2,2,3 (loaded)
   0,0,0 (pending) -+
                    |                   +- 2,0,2 (loaded)  -+- 4,0,3 (pending)
                    +- 1,0,1 (pending) -+- 2,1,2 (loaded)  -+- 4,2,3 (loaded)
                                        +- 3,0,2 (pending) -+- 6,0,3 (pending)
                                        +- 3,1,2 (pending) -+- 6,2,3 (loaded)
   */
  const TEST_CASES = [
    {
      selectedTiles: ['0,0,0']
    },
    {
      selectedTiles: ['0,0,1']
    },
    {
      selectedTiles: ['0,0,1', '1,0,1']
    },
    {
      selectedTiles: ['0,0,2', '0,1,2']
    },
    {
      selectedTiles: ['2,0,2', '2,1,2', '3,0,2', '3,1,2']
    },
    {
      selectedTiles: ['0,0,3', '2,0,3']
    },
    {
      selectedTiles: ['0,0,3', '0,2,3', '2,0,3', '2,2,3']
    },
    {
      selectedTiles: ['4,0,3', '6,0,3']
    },
    {
      selectedTiles: ['4,0,3', '4,2,3', '6,0,3', '6,2,3']
    },
    {
      selectedTiles: ['0,0,4', '0,4,4']
    }
  ];

  const tileMap = tileset._cache;
  const strategies = [STRATEGY_DEFAULT, STRATEGY_REPLACE, STRATEGY_NEVER];
  tileset._viewport = new WebMercatorViewport({longitude: 0, latitude: 0, zoom: 0});

  // Tiles that should be loaded
  tileset._getTile({x: 0, y: 0, z: 1}, true);
  tileset._getTile({x: 2, y: 0, z: 2}, true);
  tileset._getTile({x: 2, y: 1, z: 2}, true);
  tileset._getTile({x: 0, y: 2, z: 3}, true);
  tileset._getTile({x: 2, y: 2, z: 3}, true);
  tileset._getTile({x: 4, y: 2, z: 3}, true);
  tileset._getTile({x: 6, y: 2, z: 3}, true);

  await sleep(100);

  // Tiles that should be pending
  tileset._getTile({x: 0, y: 0, z: 0}, true);
  tileset._getTile({x: 1, y: 0, z: 1}, true);
  tileset._getTile({x: 0, y: 0, z: 2}, true);
  tileset._getTile({x: 0, y: 1, z: 2}, true);
  tileset._getTile({x: 3, y: 0, z: 2}, true);
  tileset._getTile({x: 3, y: 1, z: 2}, true);
  tileset._getTile({x: 0, y: 0, z: 3}, true);
  tileset._getTile({x: 2, y: 0, z: 3}, true);
  tileset._getTile({x: 4, y: 0, z: 3}, true);
  tileset._getTile({x: 6, y: 0, z: 3}, true);
  tileset._getTile({x: 0, y: 0, z: 4}, true);
  tileset._getTile({x: 0, y: 4, z: 4}, true);

  tileset._rebuildTree();

  // Sanity check
  t.ok(tileset._getTile({x: 0, y: 0, z: 1}).isLoaded, '0,0,1 is loaded');
  t.notOk(tileset._getTile({x: 0, y: 0, z: 0}).isLoaded, '0,0,0 is not loaded');

  for (const testCase of TEST_CASES) {
    const selectedTiles = testCase.selectedTiles.map(id => tileMap.get(id));
    tileset._selectedTiles = selectedTiles;

    for (const strategy of strategies) {
      tileset.setOptions({refinementStrategy: strategy});
      tileset.updateTileStates();
      const error = validateVisibility(strategy, selectedTiles, tileset._cache);
      if (error) {
        t.fail(`${strategy}: ${error}`);
      } else {
        t.pass(`${strategy}: correctly updated tile visibilities`);
      }
    }
  }

  t.end();
});

function validateVisibility(strategy, selectedTiles, tiles) {
  switch (strategy) {
    case STRATEGY_NEVER: {
      // isVisible should match isSelected
      for (const [id, tile] of tiles) {
        const isSelected = selectedTiles.includes(tile);
        if (isSelected && !tile.isVisible) {
          return `${id} is selected and should be visible`;
        }
        if (!isSelected && tile.isVisible) {
          return `${id} is not selected and should be hidden`;
        }
      }
      break;
    }
    case STRATEGY_DEFAULT:
      // The best content (at the requested z) should always be visible
      for (const tile of selectedTiles) {
        if (tile.isLoaded && !tile.isVisible) {
          return `${tile.id} is selected and should be visible`;
        }
      }
    // Fall through
    case STRATEGY_REPLACE: {
      // Sample four points each selected tile just inside the corners
      const samplePoints = selectedTiles.flatMap(({bbox}) => [
        [bbox.west + 1, bbox.north - 1],
        [bbox.east - 1, bbox.north - 1],
        [bbox.west + 1, bbox.south + 1],
        [bbox.east - 1, bbox.south + 1]
      ]);
      for (const p of samplePoints) {
        const loadedTiles = [];
        const visibleTiles = [];
        // Check if any content is rendered at this location
        for (const [id, tile] of tiles) {
          if (tile.isLoaded && contains(tile.bbox, p)) {
            loadedTiles.push(id);
            if (tile.isVisible) {
              visibleTiles.push(id);
            }
          }
        }
        if (loadedTiles.length > 0 && visibleTiles.length === 0) {
          return `One of ${loadedTiles} should be visible`;
        }
        if (strategy === STRATEGY_REPLACE && visibleTiles.length > 1) {
          return `Overlapping tiles: ${visibleTiles}`;
        }
      }
    }
  }
  return null;
}

function contains(bbox, point) {
  return (
    point[0] >= bbox.west &&
    point[0] <= bbox.east &&
    point[1] >= bbox.south &&
    point[1] <= bbox.north
  );
}

function sleep(ms) {
  return new Promise(resolve => {
    /* global setTimeout */
    setTimeout(resolve, ms);
  });
}
