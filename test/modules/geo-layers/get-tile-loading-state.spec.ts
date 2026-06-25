// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {TileLayer} from '@deck.gl/geo-layers';

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
        {isLoaded: true, content: null},
        {isLoaded: true, content: TEST_DATA},
        {isLoaded: true, content: null}
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
        {isLoaded: true, content: null}
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
        {isLoaded: true, content: null},
        {isLoaded: true, content: null},
        {isLoaded: true, content: null}
      ]
    }
  } as any;

  const state = layer.getTileLoadingState();

  expect(state.total).toBe(3);
  expect(state.loaded).toBe(0);
  expect(state.failed).toBe(3);
  expect(state.pending).toBe(0);
});
