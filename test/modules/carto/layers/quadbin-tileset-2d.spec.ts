// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
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

test('Quadbin conversion', async t => {
  for (const {x, y, z, q} of TEST_TILES) {
    const tile = {x, y, z};
    const quadbin = bigIntToHex(tileToCell(tile));
    t.deepEqual(quadbin, q, 'quadbins match');

    const tile2 = cellToTile(hexToBigInt(quadbin));
    t.deepEqual(tile, tile2, 'tiles match');
  }

  t.end();
});

test('Quadbin getParent', async t => {
  let tile = {x: 134, y: 1238, z: 10};
  const quadkey = tileToQuadkey(tile);

  while (tile.z > 0) {
    const quadbin = tileToCell(tile);
    const parent = cellToParent(quadbin);
    const zoom = getResolution(parent);
    tile = cellToTile(parent);
    const quadkey2 = tileToQuadkey(tile);

    t.deepEquals(quadkey2, quadkey.slice(0, tile.z), `parent correct ${quadkey2}`);
    t.deepEquals(Number(zoom), tile.z, `zoom correct ${zoom}`);
  }

  t.end();
});

test('QuadbinTileset2D', async t => {
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
  t.deepEqual(
    indices,
    [
      {q: 5216294268401876991n, i: '4863ffffffffffff'},
      {q: 5217796201285419007n, i: '486955ffffffffff'},
      {q: 5217045234843647999n, i: '4866aaffffffffff'},
      {q: 5218547167727190015n, i: '486c00ffffffffff'}
    ],
    'indices in viewport'
  );
  t.equal(tileset.getTileId({i: '4863ffffffffffff'}), '4863ffffffffffff', 'tile id');
  t.equal(
    tileset.getTileId({q: hexToBigInt('4863ffffffffffff')}),
    '4863ffffffffffff',
    'tile id from q'
  );
  t.deepEqual(
    tileset.getTileMetadata({q: 5206706527007670271n}),
    {
      bbox: {west: -45, north: 74.01954331150226, east: -22.5, south: 66.51326044311186}
    },
    'tile metadata'
  );
  t.equal(tileset.getTileZoom({q: 5206706527007670271n}), 4, 'tile zoom');
  t.deepEqual(
    tileset.getParentIndex({q: 5206706527007670271n}),
    {q: 5202220519566344191n},
    'tile parent'
  );
  t.end();
});

test('QuadbinTileset2D#tileSize', async t => {
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

  t.equal(indices512.length, 8, 'indices.length @ 512px');
  t.equal(indices1024.length, 4, 'indices.length @ 1024px');
  t.equal(indices2048.length, 4, 'indices.length @ 2048px');

  t.deepEqual(
    indices512,
    [
      {q: 5216293168890249215n, i: '4863feffffffffff'},
      {q: 5216294268401876991n, i: '4863ffffffffffff'},
      {q: 5217795101773791231n, i: '486954ffffffffff'},
      {q: 5217796201285419007n, i: '486955ffffffffff'},
      {q: 5217045234843647999n, i: '4866aaffffffffff'},
      {q: 5217046334355275775n, i: '4866abffffffffff'},
      {q: 5218547167727190015n, i: '486c00ffffffffff'},
      {q: 5218548267238817791n, i: '486c01ffffffffff'}
    ],
    'indices @ 512px'
  );

  t.deepEqual(
    indices1024,
    [
      {q: 5211790668774506495n, i: '4853ffffffffffff'},
      {q: 5213294800681304063n, i: '485957ffffffffff'},
      {q: 5212542734727905279n, i: '4856abffffffffff'},
      {q: 5214046866634702847n, i: '485c03ffffffffff'}
    ],
    'indices @ 1024px'
  );

  t.deepEqual(
    indices2048,
    [
      {q: 5207287069147135999n, i: '4843ffffffffffff'},
      {q: 5208799997146955775n, i: '48495fffffffffff'},
      {q: 5208043533147045887n, i: '4846afffffffffff'},
      {q: 5209556461146865663n, i: '484c0fffffffffff'}
    ],
    'indices @ 2048px'
  );

  t.equal(tileset512.getTileZoom(indices512[0]), 6, 'zoom @ 512px');
  t.equal(tileset1024.getTileZoom(indices1024[0]), 5, 'zoom @ 1024px');
  t.equal(tileset2048.getTileZoom(indices2048[0]), 4, 'zoom @ 2048px');

  t.end();
});
