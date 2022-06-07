import test from 'tape-promise/tape';
import H3Tileset2D from '@deck.gl/carto/layers/h3-tileset-2d';
import {WebMercatorViewport} from '@deck.gl/core';

test('H3Tileset2D', async t => {
  const tileset = new H3Tileset2D({});
  const viewport = new WebMercatorViewport({
    latitude: 0,
    longitude: 0,
    zoom: 6,
    width: 300,
    height: 200
  });

  const indices = tileset.getTileIndices({viewport});
  t.deepEqual(
    indices,
    [
      {i: '82754ffffffffff'},
      {i: '82755ffffffffff'},
      {i: '827547fffffffff'},
      {i: '8274effffffffff'},
      {i: '82756ffffffffff'}
    ],
    'indices in viewport'
  );
  t.equal(tileset.getTileId({i: '82754ffffffffff'}), '82754ffffffffff', 'tile id');
  t.deepEqual(
    tileset.getTileMetadata({i: '82754ffffffffff'}),
    {
      bbox: {
        west: -0.8199508788179312,
        south: -1.855492618547643,
        east: 1.9211969045935835,
        north: 0.9361637645983679
      }
    },
    'tile metadata'
  );
  t.equal(tileset.getTileZoom({i: '82754ffffffffff'}), 2, 'tile zoom');
  t.deepEqual(
    tileset.getParentIndex({i: '82754ffffffffff'}),
    {i: '81757ffffffffff'},
    'tile parent'
  );
  t.end();
});

test('H3Tileset2D res0', async t => {
  const tileset = new H3Tileset2D({});
  const viewport = new WebMercatorViewport({
    latitude: 0,
    longitude: 0,
    zoom: 1,
    width: 1023,
    height: 1024
  });

  const indices = tileset.getTileIndices({viewport});
  t.equal(indices.length, 122, 'res0 indices in viewport');
  t.end();
});

test('H3Tileset2D large span', async t => {
  const tileset = new H3Tileset2D({});
  const viewport = new WebMercatorViewport({
    latitude: 0,
    longitude: 0,
    zoom: 1,
    width: 1000,
    height: 400
  });

  const indices = tileset.getTileIndices({viewport});
  t.equal(indices.length, 114, 'large viewport span');
  t.end();
});
