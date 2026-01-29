// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import H3Tileset2D from '@deck.gl/carto/layers/h3-tileset-2d';
import {Viewport, WebMercatorViewport} from '@deck.gl/core';
import {equals} from '@math.gl/core';

test('H3Tileset2D', async () => {
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
  expect(indices, 'indices in viewport').toEqual([
    {i: '8274effffffffff'},
    {i: '827547fffffffff'},
    {i: '82754ffffffffff'},
    {i: '82755ffffffffff'},
    {i: '82756ffffffffff'},
    {i: '82825ffffffffff'}
  ]);
  expect(tileset.getTileId({i: '82754ffffffffff'}), 'tile id').toBe('82754ffffffffff');
  const {bbox} = tileset.getTileMetadata({i: '82754ffffffffff'});
  const expectedBbox = {
    west: -1.0122479382442804,
    south: -2.0477834895958438,
    east: 2.113493964019933,
    north: 1.1284546356465657
  };
  expect(
    Object.keys(bbox).every(name => equals(bbox[name], expectedBbox[name])),
    'tile metadata'
  ).toBeTruthy();
  expect(tileset.getTileZoom({i: '82754ffffffffff'}), 'tile zoom').toBe(2);
  expect(tileset.getParentIndex({i: '82754ffffffffff'}), 'tile parent').toEqual({
    i: '81757ffffffffff'
  });
});

test('H3Tileset2D#tileSize', async () => {
  const tileset512 = new H3Tileset2D({tileSize: 512});
  const tileset1024 = new H3Tileset2D({tileSize: 1024});
  const tileset2048 = new H3Tileset2D({tileSize: 2048});

  const viewport = new WebMercatorViewport({
    latitude: 0,
    longitude: 0,
    zoom: 9,
    width: 1440,
    height: 900
  });

  const indicesSort = (a, b) => parseInt(a.i, 16) - parseInt(b.i, 16);
  const indices512 = tileset512.getTileIndices({viewport}).sort(indicesSort);
  const indices1024 = tileset1024.getTileIndices({viewport}).sort(indicesSort);
  const indices2048 = tileset2048.getTileIndices({viewport}).sort(indicesSort);

  expect(indices512.length, 'indices.length @ 512px').toBe(42);
  expect(indices1024.length, 'indices.length @ 1024px').toBe(8);
  expect(indices2048.length, 'indices.length @ 2048px').toBe(4);

  expect(indices512[0], 'indices[0] @ 512px').toEqual({i: '8475481ffffffff'});
  expect(indices1024[0], 'indices[0] @ 1024px').toEqual({i: '837548fffffffff'});
  expect(indices2048[0], 'indices[0] @ 2048px').toEqual({i: '8274effffffffff'});

  expect(tileset512.getTileZoom(indices512[0]), 'zoom @ 512px').toBe(4);
  expect(tileset1024.getTileZoom(indices1024[0]), 'zoom @ 1024px').toBe(3);
  expect(tileset2048.getTileZoom(indices2048[0]), 'zoom @ 2048px').toBe(2);
});

test('H3Tileset2D res0', async () => {
  const tileset = new H3Tileset2D({});
  const viewport = new WebMercatorViewport({
    latitude: 0,
    longitude: 0,
    zoom: 1,
    width: 1024,
    height: 1024
  });

  const indices = tileset.getTileIndices({viewport});
  expect(indices.length, 'res0 indices in viewport').toBe(122);
});

test('H3Tileset2D large span', async () => {
  const tileset = new H3Tileset2D({});
  const viewport = new WebMercatorViewport({
    latitude: 0,
    longitude: 0,
    zoom: 1,
    width: 2048,
    height: 800
  });

  const indices = tileset.getTileIndices({viewport});
  expect(indices.length, 'large viewport span').toBe(122);
});

test('H3Tileset2D min zoom', async () => {
  const tileset = new H3Tileset2D({});
  const viewport = new WebMercatorViewport({
    latitude: 0,
    longitude: 0,
    zoom: 1,
    width: 300,
    height: 200
  });

  let indices = tileset.getTileIndices({viewport});
  expect(indices.length, 'without min zoom').toBe(31);
  indices = tileset.getTileIndices({viewport, minZoom: 1});
  expect(indices.length, 'min zoom added').toBe(0);
});

test('H3Tileset2D max zoom', async () => {
  const tileset = new H3Tileset2D({});
  const viewport = new WebMercatorViewport({
    latitude: 0,
    longitude: 0,
    zoom: 8,
    width: 1000,
    height: 800
  });

  let indices = tileset.getTileIndices({viewport});
  expect(indices.length, 'without max zoom').toBe(18);
  indices = tileset.getTileIndices({viewport, maxZoom: 1});
  expect(indices.length, 'max zoom added').toBe(7);
});

test('H3Tileset2D default viewport', async () => {
  const tileset = new H3Tileset2D({});
  // See layer-manager.ts
  const viewport = new Viewport({id: 'DEFAULT-INITIAL-VIEWPORT'});
  let indices = tileset.getTileIndices({viewport});
  expect(indices.length, 'Empty initial viewport').toBe(0);
});
