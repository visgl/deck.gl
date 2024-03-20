import test from 'tape-promise/tape';
import H3Tileset2D from '@deck.gl/carto/layers/h3-tileset-2d';
import {Viewport, WebMercatorViewport} from '@deck.gl/core';
import {equals} from '@math.gl/core';

test('H3Tileset2D', async t => {
  const tileset = new H3Tileset2D({});
  const viewport = new WebMercatorViewport({
    latitude: 0,
    longitude: 0,
    zoom: 6,
    width: 300,
    height: 200
  });

  const indices = tileset
    .getTileIndices({viewport})
    // Sort for reliable test output
    .sort((a, b) => parseInt(a.i, 16) - parseInt(b.i, 16));
  t.deepEqual(
    indices,
    [
      {i: '8274effffffffff'},
      {i: '827547fffffffff'},
      {i: '82754ffffffffff'},
      {i: '82755ffffffffff'},
      {i: '82756ffffffffff'}
    ],
    'indices in viewport'
  );
  t.equal(tileset.getTileId({i: '82754ffffffffff'}), '82754ffffffffff', 'tile id');
  const {bbox} = tileset.getTileMetadata({i: '82754ffffffffff'});
  const expectedBbox = {
    west: -0.8199508788179312,
    south: -1.855492618547643,
    east: 1.9211969045935835,
    north: 0.9361637645983679
  };
  t.ok(
    Object.keys(bbox).every(name => equals(bbox[name], expectedBbox[name])),
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

test('H3Tileset2D#tileSize', async t => {
  const tileset512 = new H3Tileset2D({tileSize: 512});
  const tileset1024 = new H3Tileset2D({tileSize: 1024});
  const tileset2048 = new H3Tileset2D({tileSize: 2048});

  const viewport = new WebMercatorViewport({
    latitude: 0,
    longitude: 0,
    zoom: 6,
    width: 300,
    height: 200
  });

  const indicesSort = (a, b) => parseInt(a.i, 16) - parseInt(b.i, 16);
  const indices512 = tileset512.getTileIndices({viewport}).sort(indicesSort);
  const indices1024 = tileset1024.getTileIndices({viewport}).sort(indicesSort);
  const indices2048 = tileset2048.getTileIndices({viewport}).sort(indicesSort);

  t.deepEqual(
    indices512,
    [
      {i: '8274effffffffff'},
      {i: '827547fffffffff'},
      {i: '82754ffffffffff'},
      {i: '82755ffffffffff'},
      {i: '82756ffffffffff'}
    ],
    'indices @ 512px'
  );
  t.deepEqual(indices1024, [{i: '81757ffffffffff'}], 'indices @ 1024px');
  t.deepEqual(indices2048, [{i: '8075fffffffffff'}], 'indices @ 2048px');

  t.equal(tileset512.getTileZoom(indices512[0]), 2, 'zoom @ 512px');
  t.equal(tileset1024.getTileZoom(indices1024[0]), 1, 'zoom @ 1024px');
  t.equal(tileset2048.getTileZoom(indices2048[0]), 0, 'zoom @ 2048px');

  t.end();
});

test('H3Tileset2D res0', async t => {
  const tileset = new H3Tileset2D({});
  const viewport = new WebMercatorViewport({
    latitude: 0,
    longitude: 0,
    zoom: 1,
    width: 1024,
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
    width: 2048,
    height: 800
  });

  const indices = tileset.getTileIndices({viewport});
  t.equal(indices.length, 122, 'large viewport span');
  t.end();
});

test('H3Tileset2D min zoom', async t => {
  const tileset = new H3Tileset2D({});
  const viewport = new WebMercatorViewport({
    latitude: 0,
    longitude: 0,
    zoom: 1,
    width: 300,
    height: 200
  });

  let indices = tileset.getTileIndices({viewport});
  t.equal(indices.length, 28, 'without min zoom');
  indices = tileset.getTileIndices({viewport, minZoom: 1});
  t.equal(indices.length, 0, 'min zoom added');
  t.end();
});

test('H3Tileset2D max zoom', async t => {
  const tileset = new H3Tileset2D({});
  const viewport = new WebMercatorViewport({
    latitude: 0,
    longitude: 0,
    zoom: 8,
    width: 1000,
    height: 800
  });

  let indices = tileset.getTileIndices({viewport});
  t.equal(indices.length, 16, 'without max zoom');
  indices = tileset.getTileIndices({viewport, maxZoom: 1});
  t.equal(indices.length, 7, 'max zoom added');
  t.end();
});

test('H3Tileset2D default viewport', async t => {
  const tileset = new H3Tileset2D({});
  // See layer-manager.ts
  const viewport = new Viewport({id: 'DEFAULT-INITIAL-VIEWPORT'});
  let indices = tileset.getTileIndices({viewport});
  t.equal(indices.length, 0, 'Empty initial viewport');
  t.end();
});
