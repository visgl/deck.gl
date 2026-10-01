// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {TileLayer, _Tile2DHeader as Tile2DHeader} from '@deck.gl/geo-layers';
import {RequestScheduler} from '@loaders.gl/loader-utils';

const TEST_DATA = [{position: [0, 0]}, {position: [1, 1]}];

test('TileLayer#getTileLoadingState - empty layer', () => {
  const layer = new TileLayer({
    data: 'https://example.com/tiles/{z}/{x}/{y}',
    getTileData: () => null
  });

  const state = layer.getTileLoadingState();

  expect(state.total).toBe(0);
  expect(state.loaded).toBe(0);
  expect(state.failed).toBe(0);
  expect(state.pending).toBe(0);
});

test('TileLayer#getTileLoadingState - all tiles loaded successfully', () => {
  const layer = new TileLayer({
    id: 'test-layer',
    data: 'https://example.com/tiles/{z}/{x}/{y}',
    getTileData: async () => TEST_DATA
  });

  layer.state = {
    tileset: {
      selectedTiles: [
        {isLoaded: true, content: TEST_DATA},
        {isLoaded: true, content: TEST_DATA},
        {isLoaded: true, content: TEST_DATA}
      ]
    }
  } as any;

  const state = layer.getTileLoadingState();

  expect(state.total).toBe(3);
  expect(state.loaded).toBe(3);
  expect(state.failed).toBe(0);
  expect(state.pending).toBe(0);
});

test('TileLayer#getTileLoadingState - some tiles failed', () => {
  const layer = new TileLayer({
    id: 'test-layer',
    data: 'https://example.com/tiles/{z}/{x}/{y}',
    getTileData: async () => TEST_DATA
  });

  layer.state = {
    tileset: {
      selectedTiles: [
        {isLoaded: true, content: TEST_DATA},
        {isLoaded: true, isFailed: true, content: null},
        {isLoaded: true, content: TEST_DATA},
        {isLoaded: true, isFailed: true, content: null}
      ]
    }
  } as any;

  const state = layer.getTileLoadingState();

  expect(state.total).toBe(4);
  expect(state.loaded).toBe(2);
  expect(state.failed).toBe(2);
  expect(state.pending).toBe(0);
});

test('TileLayer#getTileLoadingState - tiles still loading', () => {
  const layer = new TileLayer({
    id: 'test-layer',
    data: 'https://example.com/tiles/{z}/{x}/{y}',
    getTileData: async () => TEST_DATA
  });

  layer.state = {
    tileset: {
      selectedTiles: [
        {isLoaded: true, content: TEST_DATA},
        {isLoaded: false, content: null},
        {isLoaded: false, content: null},
        {isLoaded: true, isFailed: true, content: null}
      ]
    }
  } as any;

  const state = layer.getTileLoadingState();

  expect(state.total).toBe(4);
  expect(state.loaded).toBe(1);
  expect(state.failed).toBe(1);
  expect(state.pending).toBe(2);
});

test('TileLayer#getTileLoadingState - all tiles failed', () => {
  const layer = new TileLayer({
    id: 'test-layer',
    data: 'https://example.com/tiles/{z}/{x}/{y}',
    getTileData: async () => {
      throw new Error('Network error');
    }
  });

  layer.state = {
    tileset: {
      selectedTiles: [
        {isLoaded: true, isFailed: true, content: null},
        {isLoaded: true, isFailed: true, content: null},
        {isLoaded: true, isFailed: true, content: null}
      ]
    }
  } as any;

  const state = layer.getTileLoadingState();

  expect(state.total).toBe(3);
  expect(state.loaded).toBe(0);
  expect(state.failed).toBe(3);
  expect(state.pending).toBe(0);
});

test('TileLayer#getTileLoadingState distinguishes empty success, errors, reload and cancellation', async () => {
  const layer = new TileLayer({id: 'request-outcomes', data: []});
  const tiles = [new Tile2DHeader({x: 0, y: 0, z: 1}), new Tile2DHeader({x: 1, y: 0, z: 1})];
  layer.state = {tileset: {selectedTiles: tiles}} as any;
  const callbacks = {
    requestScheduler: new RequestScheduler({throttleRequests: false}),
    onLoad: () => {},
    onError: () => {}
  };
  await tiles[0].loadData({...callbacks, getData: async () => null});
  await tiles[1].loadData({
    ...callbacks,
    getData: async () => {
      throw new Error('request failed');
    }
  });
  expect(layer.getTileLoadingState()).toEqual({total: 2, loaded: 1, failed: 1, pending: 0});

  tiles[1].setNeedsReload();
  expect(tiles[1].isFailed).toBe(false);
  expect(layer.getTileLoadingState()).toEqual({total: 2, loaded: 1, failed: 0, pending: 1});
  await tiles[1].loadData({...callbacks, getData: async () => []});
  expect(layer.getTileLoadingState()).toEqual({total: 2, loaded: 2, failed: 0, pending: 0});

  const cancelled = tiles[1].loadData({...callbacks, getData: async () => null});
  tiles[1].abort();
  await cancelled;
  expect(layer.getTileLoadingState()).toEqual({total: 2, loaded: 1, failed: 0, pending: 1});
});
