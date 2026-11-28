// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi, afterEach} from 'vitest';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {TILE_TYPE} from '@loaders.gl/tiles-3d/tileset';

afterEach(() => {
  vi.unstubAllGlobals();
});

function makeTile(id: string, parent: object, type: string = TILE_TYPE.SCENEGRAPH) {
  return {id, parent, type, selected: true, content: {}};
}

function makeLayer(props: Record<string, unknown>, tiles: object[]) {
  const layer = new Tile3DLayer(props);
  layer.state = {
    tileset3d: {tiles, selectedTiles: tiles, destroy: vi.fn()},
    layerMap: {}
  } as never;
  // @ts-expect-error private method
  const getSubLayer = vi.spyOn(layer, '_getSubLayer').mockImplementation(tile => ({id: tile.id}));
  const renderedIds = () => (layer.renderLayers() as {id: string}[]).map(sublayer => sublayer.id);
  return {layer, getSubLayer, renderedIds};
}

/** Collects frame requests, so that a test can run them */
function stubFrames() {
  const frames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback));
  return frames;
}

test('Tile3DLayer#_maxNewTilesPerFrame creates new glTF tiles over several frames', () => {
  const frames = stubFrames();
  const parentA = {id: 'a'};
  const parentB = {id: 'b'};
  const tiles = [
    makeTile('a1', parentA),
    makeTile('b1', parentB),
    makeTile('a2', parentA),
    makeTile('mesh', parentB, TILE_TYPE.MESH),
    makeTile('b2', parentB),
    makeTile('a3', parentA)
  ];
  const {layer, renderedIds} = makeLayer({_maxNewTilesPerFrame: 2}, tiles);
  layer.internalState = {layer} as never;
  const setNeedsUpdate = vi.spyOn(layer, 'setNeedsUpdate').mockImplementation(() => {});

  expect(renderedIds(), 'siblings together; meshes are not held back').toEqual([
    'a1',
    'a2',
    'mesh',
    'a3'
  ]);
  expect(frames, 'requests the next batch').toHaveLength(1);

  frames[0](0);
  expect(setNeedsUpdate, 'updates the layer next frame').toHaveBeenCalledOnce();
  expect(layer.state.nextTilesFrame, 'clears the request').toBeUndefined();
  expect(renderedIds(), 'creates the rest').toEqual(['a1', 'b1', 'a2', 'mesh', 'b2', 'a3']);
  expect(frames, 'nothing left to defer').toHaveLength(1);
});

test('Tile3DLayer#_maxNewTilesPerFrame does not split siblings', () => {
  const frames = stubFrames();
  const parent = {id: 'p'};
  const tiles = ['t1', 't2', 't3', 't4'].map(id => makeTile(id, parent));
  const {renderedIds} = makeLayer({_maxNewTilesPerFrame: 2}, tiles);

  expect(renderedIds()).toEqual(['t1', 't2', 't3', 't4']);
  expect(frames, 'nothing left to defer').toHaveLength(0);
});

test('Tile3DLayer#_maxNewTilesPerFrame splits a sibling group that is too large', () => {
  const frames = stubFrames();
  const parent = {id: 'p'};
  const tiles = Array.from({length: 10}, (_, index) => makeTile(`t${index}`, parent));
  const {layer, renderedIds} = makeLayer({_maxNewTilesPerFrame: 2}, tiles);
  layer.internalState = {layer} as never;
  vi.spyOn(layer, 'setNeedsUpdate').mockImplementation(() => {});

  const createdPerFrame: number[] = [];
  let created = 0;
  let frame: FrameRequestCallback | undefined;
  do {
    frame?.(0);
    const rendered = renderedIds().length;
    createdPerFrame.push(rendered - created);
    created = rendered;
    frame = frames.shift();
  } while (frame);
  expect(createdPerFrame, 'never more than twice the limit').toEqual([2, 2, 2, 4]);
});

test('Tile3DLayer#_maxNewTilesPerFrame applies after a prop change', () => {
  stubFrames();
  const tiles = ['a', 'b', 'c'].map(id => makeTile(`${id}1`, {id}));
  const {layer, getSubLayer, renderedIds} = makeLayer({_maxNewTilesPerFrame: 1}, tiles);
  layer.context = {} as never;
  expect(renderedIds()).toEqual(['a1']);

  const changeFlags = {propsChanged: true};
  layer.updateState({props: layer.props, oldProps: layer.props, changeFlags} as never);
  getSubLayer.mockClear();
  expect(renderedIds(), 'creates one more tile').toEqual(['a1', 'b1']);
  expect(getSubLayer, 'updates a1 and creates b1').toHaveBeenCalledTimes(2);
});

test('Tile3DLayer#finalizeState cancels the next batch', () => {
  stubFrames();
  const cancelAnimationFrame = vi.fn();
  vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrame);
  const tiles = ['a', 'b'].map(id => makeTile(`${id}1`, {id}));
  const {layer, renderedIds} = makeLayer({_maxNewTilesPerFrame: 1}, tiles);
  renderedIds();

  layer.finalizeState({} as never);
  expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
});

test('Tile3DLayer#creates every new tile without _maxNewTilesPerFrame', () => {
  const frames = stubFrames();
  const parent = {id: 'p'};
  const tiles = ['t1', 't2', 't3'].map(id => makeTile(id, parent));
  const {renderedIds} = makeLayer({}, tiles);

  expect(renderedIds()).toEqual(['t1', 't2', 't3']);
  expect(frames).toHaveLength(0);
});
