import test from 'tape-promise/tape';
import QuadbinTileset2D, {
  tileToQuadbin,
  quadbinToTile
} from '@deck.gl/carto/layers/quadbin-tileset-2d';
import {WebMercatorViewport} from '@deck.gl/core';

const TEST_TILES = [
  {x: 0, y: 0, z: 0, q: '480fffffffffffff'},
  {x: 1, y: 2, z: 3, q: '48327fffffffffff'},
  {x: 1023, y: 2412, z: 23, q: '4970000021df7d7f'}
];

test('Quadbin conversion', async t => {
  for (const {x, y, z, q} of TEST_TILES) {
    const tile = {x, y, z};
    const quadbin = tileToQuadbin(tile);
    t.deepEqual(quadbin.i, q, 'quadbins match');

    const tile2 = quadbinToTile(quadbin);
    t.deepEqual(tile, tile2, 'tiles match');
  }

  t.end();
});

// test('QuadbinTileset2D', async t => {
//   const tileset = new QuadbinTileset2D({});
//   const viewport = new WebMercatorViewport({
//     latitude: 0,
//     longitude: 0,
//     zoom: 6,
//     width: 300,
//     height: 200
//   });
//   // Required for getTileMetadata to function
//   tileset._viewport = viewport;
//
//   const indices = tileset.getTileIndices({viewport});
//   t.deepEqual(
//     indices,
//     [{i: '033333'}, {i: '211111'}, {i: '122222'}, {i: '300000'}],
//     'indices in viewport'
//   );
//   t.equal(tileset.getTileId({i: '0132'}), '0132', 'tile id');
//   t.deepEqual(
//     tileset.getTileMetadata({i: '0132'}),
//     {
//       bbox: {west: -45, north: 74.01954331150226, east: -22.5, south: 66.51326044311186}
//     },
//     'tile metadata'
//   );
//   t.equal(tileset.getTileZoom({i: '0132'}), 4, 'tile zoom');
//   t.deepEqual(tileset.getParentIndex({i: '0132'}), {i: '013'}, 'tile parent');
//   t.end();
// });
