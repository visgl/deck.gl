// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi, afterEach} from 'vitest';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {TILE_TYPE} from '@loaders.gl/tiles-3d';

afterEach(() => {
  vi.unstubAllGlobals();
});

function makeTile(id: string, parent: object, type: string = TILE_TYPE.SCENEGRAPH) {
  return {id, parent, type, selected: true, content: {}};
}

function makeLayer(props: Record<string, unknown>, tiles: object[]) {
  const layer = new Tile3DLayer(props);
  layer.state = {tileset3d: {tiles, selectedTiles: tiles}, layerMap: {}} as never;
  // @ts-expect-error private method
  vi.spyOn(layer, '_getSubLayer').mockImplementation(tile => ({id: tile.id}));
  const renderedIds = () => (layer.renderLayers() as {id: string}[]).map(sublayer => sublayer.id);
  return {layer, renderedIds};
}

test('Tile3DLayer#_maxNewTilesPerFrame creates new glTF tiles over several frames', () => {
  const requestAnimationFrame = vi.fn(() => 1);
  vi.stubGlobal('requestAnimationFrame', requestAnimationFrame);
  const parentA = {id: 'a'};
  const parentB = {id: 'b'};
  const tiles = [
    makeTile('a1', parentA),
    makeTile('b1', parentB),
    makeTile('a2', parentA),
    makeTile('mesh', parentB, TILE_TYPE.MESH),
    makeTile('b2', parentB)
  ];
  const {layer, renderedIds} = makeLayer({_maxNewTilesPerFrame: 2}, tiles);

  expect(renderedIds(), 'siblings first; meshes are not held back').toEqual(['a1', 'a2', 'mesh']);
  expect(requestAnimationFrame, 'requests the next batch').toHaveBeenCalledOnce();

  // The frame request clears its id before updating the layer
  layer.state.nextTilesFrame = undefined;
  expect(renderedIds(), 'creates the rest next frame').toEqual(['a1', 'b1', 'a2', 'mesh', 'b2']);
  expect(requestAnimationFrame, 'nothing left to defer').toHaveBeenCalledOnce();
});

test('Tile3DLayer#creates every new tile without _maxNewTilesPerFrame', () => {
  const requestAnimationFrame = vi.fn(() => 1);
  vi.stubGlobal('requestAnimationFrame', requestAnimationFrame);
  const parent = {id: 'p'};
  const tiles = ['t1', 't2', 't3'].map(id => makeTile(id, parent));
  const {renderedIds} = makeLayer({}, tiles);

  expect(renderedIds()).toEqual(['t1', 't2', 't3']);
  expect(requestAnimationFrame).not.toHaveBeenCalled();
});
