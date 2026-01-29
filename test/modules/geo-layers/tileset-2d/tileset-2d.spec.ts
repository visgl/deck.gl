// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {_Tileset2D as Tileset2D} from '@deck.gl/geo-layers';
import {WebMercatorViewport, OrthographicView, Viewport} from '@deck.gl/core';
import {Matrix4} from '@math.gl/core';

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

test('Tileset2D#constructor', () => {
  const tileset = new Tileset2D({
    getTileData,
    minZoom: 11,
    maxZoom: null,
    onTileLoad: () => {}
  });

  expect(tileset._minZoom, 'minZoom is set').toBe(11);
  expect(tileset._maxZoom, 'maxZoom is undefined').toBeFalsy();

  tileset.setOptions({maxZoom: 13});
  expect(tileset._maxZoom, 'maxZoom is set').toBe(13);
});

test('Tileset2D#update', () => {
  const tileset = new Tileset2D({
    getTileData,
    onTileLoad: () => {}
  });
  tileset.update(testViewport);

  expect(tileset._cache.size, 'should update with expected tiles').toBe(1);
  const {x, y, z} = tileset.tiles[0].index;

  expect(x).toBe(1171);
  expect(y).toBe(1566);
  expect(z).toBe(12);
  expect(tileset.tiles[0].bbox, 'tile has metadata').toBeTruthy();
});

test('Tileset2D#updateOnModelMatrix', () => {
  const tileset = new Tileset2D({
    getTileData,
    onTileLoad: () => {}
  });
  const testOrthoraphicViewport = new OrthographicView().makeViewport({
    width: 800,
    height: 400,
    viewState: {
      target: [100, 100],
      zoom: 4
    }
  }) as Viewport;
  tileset.update(testOrthoraphicViewport, {modelMatrix: null});
  expect(tileset._cache.size, 'null model matrix updates').toBe(4);

  tileset.update(testOrthoraphicViewport, {modelMatrix: new Matrix4()});
  expect(
    tileset._cache.size,
    'identity model matrixs update with same number of tiles as null'
  ).toBe(4);

  tileset.update(testOrthoraphicViewport, {modelMatrix: new Matrix4().rotateX(Math.PI / 4)});
  expect(tileset._cache.size, 'rotation model matrix updates with new number of tiles').toBe(6);
});

test('Tileset2D#finalize', async () => {
  const tileDataPending = sleep(50);
  const tileset = new Tileset2D({
    getTileData: () => tileDataPending,
    onTileLoad: () => {}
  });

  tileset.update(testViewport);
  const tile1 = tileset.selectedTiles![0];

  await tileDataPending;
  await sleep(10);

  tileset.update(
    new WebMercatorViewport(
      Object.assign({}, testViewState, {
        longitude: -100,
        latitude: 80
      })
    )
  );
  const tile2 = tileset.selectedTiles![0];

  tileset.finalize();
  expect(tileset._cache.size, 'cache is purged').toBeFalsy();

  expect(
    tile1._isCancelled,
    'first tile should not have been loading and thus not been aborteed'
  ).toBe(false);
  expect(tile2._isCancelled, 'second tile should have been aborted').toBe(true);
});

test('Tileset2D#maxCacheSize', () => {
  const tileset = new Tileset2D({
    getTileData,
    maxCacheSize: 1,
    onTileLoad: () => {},
    onTileUnload: () => {}
  });
  // load a viewport to fill the cache
  tileset.update(testViewport);
  expect(tileset._cache.size, 'expected cache size').toBe(1);
  expect(tileset._cache.get('1171-1566-12'), 'expected tile is in cache').toBeTruthy();

  // load another viewport. The previous cached tiles shouldn't be visible
  tileset.update(
    new WebMercatorViewport(
      Object.assign({}, testViewState, {
        width: 300,
        height: 100,
        longitude: -100,
        latitude: 80
      })
    )
  );
  expect(tileset._cache.size, 'cache is resized').toBe(2);
  expect(tileset._cache.get('1171-1566-12'), 'old tile is deleted from cache').toBeFalsy();
  expect(tileset._cache.get('910-459-12'), 'expected tile is in cache').toBeTruthy();
  expect(tileset._cache.get('909-459-12'), 'expected tile is in cache').toBeTruthy();
});

test('Tileset2D#maxCacheByteSize', async () => {
  const tileset = new Tileset2D({
    getTileData: () => Promise.resolve({byteLength: 100}),
    maxCacheByteSize: 150,
    onTileLoad: () => {},
    onTileUnload: () => {}
  });
  // load a viewport to fill the cache
  tileset.update(testViewport);
  expect(tileset._cache.size, 'expected cache size').toBe(1);
  expect(tileset._cache.get('1171-1566-12'), 'expected tile is in cache').toBeTruthy();

  // Wait for the tile to load
  await sleep(100);

  // load another viewport. The previous cached tiles shouldn't be visible
  tileset.update(
    new WebMercatorViewport(
      Object.assign({}, testViewState, {
        longitude: -100,
        latitude: 80
      })
    )
  );

  expect(tileset._cache.size, 'new tile added to cache').toBe(2);

  // Wait for the new tile to load
  await sleep(100);

  expect(tileset._cache.size, 'cache is resized after tile data is loaded').toBe(1);
  expect(tileset._cache.get('910-459-12'), 'expected tile is in cache').toBeTruthy();
});

test('Tileset2D#debounceTime', async () => {
  const tileset = new Tileset2D({
    getTileData: () => sleep(2),
    maxRequests: 1000,
    debounceTime: 25,
    onTileLoad: () => {}
  });

  tileset.update(new WebMercatorViewport(Object.assign({}, testViewState, {zoom: 20})));

  await sleep(10);

  for (const tile of tileset.tiles) {
    expect(tile.isLoaded, `tile ${tile.id} pending`).toBeFalsy();
  }

  await sleep(50);

  for (const tile of tileset.tiles) {
    expect(tile.isLoaded, `tile ${tile.id} loaded`).toBeTruthy();
  }
});

test('Tileset2D#over-zoomed', () => {
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
    expect(tile.zoom).toBe(13);
  });
});

test('Tileset2D#under-zoomed', () => {
  const tileset = new Tileset2D({
    getTileData,
    minZoom: 11,
    maxZoom: 13,
    onTileLoad: () => {}
  });
  const zoomedOutViewport = new WebMercatorViewport(Object.assign({}, testViewState, {zoom: 1}));

  tileset.update(zoomedOutViewport);
  expect(tileset.tiles.length).toBe(0);
});

test('Tileset2D#under-zoomed-with-extent', () => {
  const tileset = new Tileset2D({
    getTileData,
    minZoom: 11,
    maxZoom: 13,
    extent: [-180, -85.05113, 180, 85.05113],
    onTileLoad: () => {}
  });
  const zoomedOutViewport = new WebMercatorViewport(Object.assign({}, testViewState, {zoom: 1}));

  tileset.update(zoomedOutViewport);
  const tileZoomLevels = tileset.tiles.map(tile => tile.zoom);
  expect(tileZoomLevels[0] === 11).toBeTruthy();
});

test('Tileset2D#callbacks', async () => {
  let tileLoadCalled = 0;

  const tileset = new Tileset2D({
    maxCacheSize: 1,
    getTileData: () => Promise.resolve(null),
    onTileLoad: () => tileLoadCalled++,
    onTileError: () => {},
    onTileUnload: () => {}
  });

  tileset.update(testViewport);
  await sleep(100);
  tileset.reloadAll();
  tileset.update(testViewport);
  await sleep(100);

  expect(tileLoadCalled, 'tile is reloaded when reloadAll is called').toBe(2);
});

test('Tileset2D#callbacks', async () => {
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
  expect(tileset.isLoaded, 'should be loading').toBeFalsy();

  await sleep(100);

  expect(tileset.isLoaded, 'tileset is loaded').toBeTruthy();
  expect(tileLoadCalled, 'onTileLoad is called').toBe(1);
  expect(tileErrorCalled, 'onTileError is not called').toBe(0);

  tileLoadCalled = 0;
  tileErrorCalled = 0;

  const errorTileset = new Tileset2D({
    getTileData: () => Promise.reject(null),
    onTileLoad: () => tileLoadCalled++,
    onTileError: () => tileErrorCalled++
  });

  errorTileset.update(testViewport);
  expect(errorTileset.isLoaded, 'should be loading').toBeFalsy();

  await sleep(100);

  expect(errorTileset.isLoaded, 'tileset is loaded').toBeTruthy();
  expect(tileLoadCalled, 'onTileLoad is not called').toBe(0);
  expect(tileErrorCalled, 'onTileError is called').toBe(1);

  expect(tileUnloadCalled, 'onTileUnload is not called').toBe(0);
  // load another viewport. The previous cached tiles shouldn't be visible
  tileset.update(
    new WebMercatorViewport(
      Object.assign({}, testViewState, {
        longitude: -100,
        latitude: 80
      })
    )
  );
  expect(tileUnloadCalled, 'onTileUnload is called').toBe(1);
});

/* eslint-disable max-statements, complexity, max-depth */
test('Tileset2D#traversal', async () => {
  const tileset = new Tileset2D({
    getTileData: () => sleep(10),
    onTileLoad: () => {},
    onTileError: () => {},
    maxRequests: 0
  });

  /*
    Test tiles:
                                        +- 0-0-2 (pending) -+- 0-0-3 (pending) -+- 0-0-4 (pending)
                                        +- 0-1-2 (pending) -+- 0-2-3 (loaded)  -+- 0-4-4 (pending)
                    +- 0-0-1 (loaded)  -+- 1-0-2 (missing) -+- 2-0-3 (pending)
                    |                   +- 1-1-2 (missing) -+- 2-2-3 (loaded)
   0-0-0 (pending) -+
                    |                   +- 2-0-2 (loaded)  -+- 4-0-3 (pending)
                    +- 1-0-1 (pending) -+- 2-1-2 (loaded)  -+- 4-2-3 (loaded)
                                        +- 3-0-2 (pending) -+- 6-0-3 (pending)
                                        +- 3-1-2 (pending) -+- 6-2-3 (loaded)
   */
  const TEST_CASES = [
    {
      selectedTiles: ['0-0-0']
    },
    {
      selectedTiles: ['0-0-1']
    },
    {
      selectedTiles: ['0-0-1', '1-0-1']
    },
    {
      selectedTiles: ['0-0-2', '0-1-2']
    },
    {
      selectedTiles: ['2-0-2', '2-1-2', '3-0-2', '3-1-2']
    },
    {
      selectedTiles: ['0-0-3', '2-0-3']
    },
    {
      selectedTiles: ['0-0-3', '0-2-3', '2-0-3', '2-2-3']
    },
    {
      selectedTiles: ['4-0-3', '6-0-3']
    },
    {
      selectedTiles: ['4-0-3', '4-2-3', '6-0-3', '6-2-3']
    },
    {
      selectedTiles: ['0-0-4', '0-4-4']
    }
  ];

  const tileMap = tileset._cache;
  const strategies = ['best-available', 'no-overlap', 'never'];
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
  expect(tileset._getTile({x: 0, y: 0, z: 1}).isLoaded, '0-0-1 is loaded').toBeTruthy();
  expect(tileset._getTile({x: 0, y: 0, z: 0}).isLoaded, '0-0-0 is not loaded').toBeFalsy();

  for (const testCase of TEST_CASES) {
    const selectedTiles = testCase.selectedTiles.map(id => tileMap.get(id));
    tileset._selectedTiles = selectedTiles;

    for (const strategy of strategies) {
      tileset.setOptions({refinementStrategy: strategy});
      tileset.updateTileStates();
      const error = validateVisibility(strategy, selectedTiles, tileset._cache);
      if (error) {
        throw new Error(`${strategy}: ${error}`);
      } else {
      }
    }
  }
});

test('Tileset2D#isTileVisible', async () => {
  const cullRect = {x: 50, y: 48, width: 100, height: 1};

  const testCases = [
    {
      title: 'tile visibility for render',
      viewport: new WebMercatorViewport({
        width: 200,
        height: 100,
        longitude: 0,
        latitude: 0,
        zoom: 3
      }),
      checks: [{id: '3-3-3', result: true}]
    },
    {
      title: 'culling',
      viewport: new WebMercatorViewport({
        width: 200,
        height: 100,
        longitude: -170,
        latitude: 0,
        zoom: 3
      }),
      checks: [
        {id: '3-3-3', result: false},
        {id: '0-3-3', result: true},
        {id: '0-3-3', cullRect, result: true},
        {id: '0-4-3', result: true},
        {id: '0-4-3', cullRect, result: false}
      ]
    },
    {
      title: 'visibility across the 180 meridian',
      viewport: new WebMercatorViewport({
        width: 200,
        height: 100,
        longitude: -179.9,
        latitude: 0,
        zoom: 3,
        repeat: true
      }),
      checks: [
        {id: '0-3-3', result: true},
        {id: '0-3-3', cullRect, result: true},
        {id: '0-4-3', result: true},
        {id: '0-4-3', cullRect, result: false},
        {id: '7-3-3', result: true},
        {id: '7-3-3', cullRect, result: true},
        {id: '7-4-3', result: true},
        {id: '7-4-3', cullRect, result: false}
      ]
    },
    {
      title: 'culling with zRange',
      viewport: new WebMercatorViewport({
        width: 200,
        height: 100,
        longitude: -179.9,
        latitude: 0,
        pitch: 60,
        zoom: 3,
        repeat: true
      }),
      zRange: [0, 100000],
      checks: [
        {id: '0-3-3', cullRect, result: true},
        {id: '0-4-3', cullRect, result: true},
        {id: '7-3-3', cullRect, result: true},
        {id: '7-4-3', cullRect, result: true}
      ]
    }
  ];

  let viewport, options;
  const updateTileset = () => tileset.update(viewport, options);
  const tileset = new Tileset2D({
    getTileData,
    onTileLoad: updateTileset,
    onTileError: updateTileset
  });

  for (const testCase of testCases) {
    console.log(testCase.title);
    viewport = testCase.viewport;
    options = {zRange: testCase.zRange};

    updateTileset();
    await sleep(10);

    for (const {id, cullRect, result} of testCase.checks) {
      const tile = tileset._cache.get(id);
      expect(
        tileset.isTileVisible(tile, cullRect),
        `isTileVisible ${cullRect ? 'with cullRect ' : ''}returns correct value for ${id}`
      ).toBe(result);
    }
  }
});

test('Tileset2D#isTileVisibleWithModelMatrix', async () => {
  const cullRect = {x: 0, y: 0, width: 256, height: 256};
  const identityMatrix = new Matrix4();
  const translationMatrix = new Matrix4().translate([512, 0, 0]);
  const rotationMatrix = new Matrix4().rotateZ(Math.PI / 2);

  const testCases = [
    {
      title: 'identity',
      viewport: new OrthographicView().makeViewport({
        width: 1024,
        height: 512,
        viewState: {
          target: [512, 256, 0],
          zoom: 0
        }
      }),
      modelMatrix: identityMatrix,
      checks: [
        {id: '0-0-0', modelMatrix: identityMatrix, result: true},
        {id: '1-0-0', modelMatrix: identityMatrix, result: true}
      ]
    },
    {
      title: 'translation',
      viewport: new OrthographicView().makeViewport({
        width: 1024,
        height: 512,
        viewState: {
          target: [512, 256, 0],
          zoom: 0
        }
      }),
      modelMatrix: translationMatrix,
      checks: [
        {id: '0-0-0', modelMatrix: translationMatrix, result: true},
        {id: '0-0-0', cullRect, modelMatrix: translationMatrix, result: false},
        {id: '1-0-0', modelMatrix: translationMatrix, result: false}
      ]
    },
    {
      title: 'rotation',
      viewport: new OrthographicView().makeViewport({
        width: 1024,
        height: 512,
        viewState: {
          target: [-512, 256, 0],
          zoom: 0
        }
      }),
      modelMatrix: rotationMatrix,
      checks: [
        {id: '0-0-0', modelMatrix: rotationMatrix, result: true},
        {id: '0-0-0', cullRect, modelMatrix: rotationMatrix, result: false},
        {id: '0-1-0', modelMatrix: rotationMatrix, result: true},
        {id: '0-1-0', cullRect, modelMatrix: rotationMatrix, result: true}
      ]
    }
  ];

  let viewport, options;
  const updateTileset = () => tileset.update(viewport, options);
  const tileset = new Tileset2D({
    getTileData,
    onTileLoad: updateTileset,
    onTileError: updateTileset
  });

  for (const testCase of testCases) {
    console.log(testCase.title);
    viewport = testCase.viewport;
    options = {modelMatrix: testCase.modelMatrix};

    updateTileset();
    await sleep(10);

    for (const {id, cullRect, modelMatrix, result} of testCase.checks) {
      const tile = tileset._cache.get(id);
      expect(
        tileset.isTileVisible(tile, cullRect, modelMatrix),
        `isTileVisible with modelMatrix ${cullRect ? 'with cullRect ' : ''}returns correct value for ${id}`
      ).toBe(result);
    }
  }
});

function validateVisibility(strategy, selectedTiles, tiles) {
  /* eslint-disable default-case */
  switch (strategy) {
    case 'never': {
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

    case 'best-available':
      // The best content (at the requested z) should always be visible
      for (const tile of selectedTiles) {
        if (tile.isLoaded && !tile.isVisible) {
          return `${tile.id} is selected and should be visible`;
        }
      }

    // Fall through
    case 'no-overlap': {
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
        if (strategy === 'no-overlap' && visibleTiles.length > 1) {
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
