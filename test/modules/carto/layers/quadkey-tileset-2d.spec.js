import test from 'tape-promise/tape';
import QuadkeyTileset2D from '@deck.gl/carto/layers/quadkey-tileset-2d';
import {WebMercatorViewport} from '@deck.gl/core';

test('QuadkeyTileset2D', async t => {
  const tileset = new QuadkeyTileset2D({});
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
    [{i: '033333'}, {i: '211111'}, {i: '122222'}, {i: '300000'}],
    'indices in viewport'
  );
  t.equal(tileset.getTileId({i: '0132'}), '0132', 'tile id');
  t.deepEqual(
    tileset.getTileMetadata({i: '0132'}),
    {
      bbox: {west: -45, north: 74.01954331150226, east: -22.5, south: 66.51326044311186}
    },
    'tile metadata'
  );
  t.equal(tileset.getTileZoom({i: '0132'}), 4, 'tile zoom');
  t.deepEqual(tileset.getParentIndex({i: '0132'}), {i: '013'}, 'tile parent');
  t.end();
});
