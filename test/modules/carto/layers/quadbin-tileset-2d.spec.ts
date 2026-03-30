// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import QuadbinTileset2D from '@deck.gl/carto/layers/quadbin-tileset-2d';
import {
  bigIntToHex,
  cellToParent,
  cellToTile,
  getResolution,
  hexToBigInt,
  tileToCell
} from 'quadbin';
import {WebMercatorViewport} from '@deck.gl/core';
import {tileToQuadkey} from './quadbin-tile-layer.spec';

const TEST_TILES = [
  {x: 0, y: 0, z: 0, q: '480fffffffffffff'},
  {x: 1, y: 2, z: 3, q: '48327fffffffffff'},
  {x: 1023, y: 2412, z: 23, q: '4970000021df7d7f'}
];

test('Quadbin conversion', async () => {
  for (const {x, y, z, q} of TEST_TILES) {
    const tile = {x, y, z};
    const quadbin = bigIntToHex(tileToCell(tile));
    expect(quadbin, 'quadbins match').toEqual(q);

    const tile2 = cellToTile(hexToBigInt(quadbin));
    expect(tile, 'tiles match').toEqual(tile2);
  }
});

test('Quadbin getParent', async () => {
  let tile = {x: 134, y: 1238, z: 10};
  const quadkey = tileToQuadkey(tile);

  while (tile.z > 0) {
    const quadbin = tileToCell(tile);
    const parent = cellToParent(quadbin);
    const zoom = getResolution(parent);
    tile = cellToTile(parent);
    const quadkey2 = tileToQuadkey(tile);

    expect(quadkey2, `parent correct ${quadkey2}`).toEqual(quadkey.slice(0, tile.z));
    expect(Number(zoom), `zoom correct ${zoom}`).toEqual(tile.z);
  }
});

test('QuadbinTileset2D', async () => {
  const tileset = new QuadbinTileset2D({});
  const viewport = new WebMercatorViewport({
    latitude: 0,
    longitude: 0,
    zoom: 6,
    width: 300,
    height: 200
  });
  // Required for getTileMetadata to function
  tileset._viewport = viewport;

  const indices = tileset.getTileIndices({viewport});
  expect(indices, 'indices in viewport').toEqual([
    {q: 5216294268401876991n, i: '4863ffffffffffff'},
    {q: 5217796201285419007n, i: '486955ffffffffff'},
    {q: 5217045234843647999n, i: '4866aaffffffffff'},
    {q: 5218547167727190015n, i: '486c00ffffffffff'}
  ]);
  expect(tileset.getTileId({i: '4863ffffffffffff'}), 'tile id').toBe('4863ffffffffffff');
  expect(tileset.getTileId({q: hexToBigInt('4863ffffffffffff')}), 'tile id from q').toBe(
    '4863ffffffffffff'
  );
  expect(tileset.getTileMetadata({q: 5206706527007670271n}), 'tile metadata').toEqual({
    bbox: {west: -45, north: 74.01954331150226, east: -22.5, south: 66.51326044311186}
  });
  expect(tileset.getTileZoom({q: 5206706527007670271n}), 'tile zoom').toBe(4);
  expect(tileset.getParentIndex({q: 5206706527007670271n}), 'tile parent').toEqual({
    q: 5202220519566344191n
  });
});

test('QuadbinTileset2D#tileSize', async () => {
  const tileset512 = new QuadbinTileset2D({tileSize: 512});
  const tileset1024 = new QuadbinTileset2D({tileSize: 1024});
  const tileset2048 = new QuadbinTileset2D({tileSize: 2048});
  const viewport = new WebMercatorViewport({
    latitude: 0,
    longitude: 0,
    zoom: 6,
    width: 1440,
    height: 900
  });

  // Required for getTileMetadata to function
  tileset512._viewport = viewport;
  tileset1024._viewport = viewport;
  tileset2048._viewport = viewport;

  const indices512 = tileset512.getTileIndices({viewport});
  const indices1024 = tileset1024.getTileIndices({viewport});
  const indices2048 = tileset2048.getTileIndices({viewport});

  expect(indices512.length, 'indices.length @ 512px').toBe(8);
  expect(indices1024.length, 'indices.length @ 1024px').toBe(4);
  expect(indices2048.length, 'indices.length @ 2048px').toBe(4);

  expect(indices512, 'indices @ 512px').toEqual([
    {q: 5216293168890249215n, i: '4863feffffffffff'},
    {q: 5216294268401876991n, i: '4863ffffffffffff'},
    {q: 5217795101773791231n, i: '486954ffffffffff'},
    {q: 5217796201285419007n, i: '486955ffffffffff'},
    {q: 5217045234843647999n, i: '4866aaffffffffff'},
    {q: 5217046334355275775n, i: '4866abffffffffff'},
    {q: 5218547167727190015n, i: '486c00ffffffffff'},
    {q: 5218548267238817791n, i: '486c01ffffffffff'}
  ]);

  expect(indices1024, 'indices @ 1024px').toEqual([
    {q: 5211790668774506495n, i: '4853ffffffffffff'},
    {q: 5213294800681304063n, i: '485957ffffffffff'},
    {q: 5212542734727905279n, i: '4856abffffffffff'},
    {q: 5214046866634702847n, i: '485c03ffffffffff'}
  ]);

  expect(indices2048, 'indices @ 2048px').toEqual([
    {q: 5207287069147135999n, i: '4843ffffffffffff'},
    {q: 5208799997146955775n, i: '48495fffffffffff'},
    {q: 5208043533147045887n, i: '4846afffffffffff'},
    {q: 5209556461146865663n, i: '484c0fffffffffff'}
  ]);

  expect(tileset512.getTileZoom(indices512[0]), 'zoom @ 512px').toBe(6);
  expect(tileset1024.getTileZoom(indices1024[0]), 'zoom @ 1024px').toBe(5);
  expect(tileset2048.getTileZoom(indices2048[0]), 'zoom @ 2048px').toBe(4);
});
