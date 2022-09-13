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
