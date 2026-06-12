// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {TileLayer} from '@deck.gl/geo-layers';
import {getTileLoadingState} from '@deck.gl/geo-layers/tile-layer/get-tile-loading-state';

const TEST_DATA = [
  {position: [0, 0]},
  {position: [1, 1]}
];

test('getTileLoadingState#empty layer', () => {
  const layer = new TileLayer({
    data: 'https://example.com/tiles/{z}/{x}/{y}',
    getTileData: () => null
  });

  const state = getTileLoadingState(layer);

  expect(state.total).toBe(0);
  expect(state.loaded).toBe(0);
  expect(state.failed).toBe(0);
  expect(state.pending).toBe(0);
  expect(state.percentLoaded).toBe(100);
  expect(state.isComplete).toBe(true);
  expect(state.isSuccess).toBe(true);
});

test('getTileLoadingState#all tiles loaded successfully', () => {
  const layer = new TileLayer({
    id: 'test-layer',
    data: 'https://example.com/tiles/{z}/{x}/{y}',
    getTileData: async () => TEST_DATA
  });

  // Mock tileset state with loaded tiles
  layer.state = {
    tileset: {
      selectedTiles: [
        {isLoaded: true, content: TEST_DATA},
        {isLoaded: true, content: TEST_DATA},
        {isLoaded: true, content: TEST_DATA}
      ]
    }
  } as any;

  const state = getTileLoadingState(layer);

  expect(state.total).toBe(3);
  expect(state.loaded).toBe(3);
  expect(state.failed).toBe(0);
  expect(state.pending).toBe(0);
  expect(state.percentLoaded).toBe(100);
  expect(state.isComplete).toBe(true);
  expect(state.isSuccess).toBe(true);
});

test('getTileLoadingState#some tiles failed', () => {
  const layer = new TileLayer({
    id: 'test-layer',
    data: 'https://example.com/tiles/{z}/{x}/{y}',
    getTileData: async () => TEST_DATA
  });

  // Mock tileset with successful and failed tiles
  layer.state = {
    tileset: {
      selectedTiles: [
        {isLoaded: true, content: TEST_DATA},   // Success
        {isLoaded: true, content: null},         // Failed (404, error, etc.)
        {isLoaded: true, content: TEST_DATA},   // Success
        {isLoaded: true, content: null}          // Failed
      ]
    }
  } as any;

  const state = getTileLoadingState(layer);

  expect(state.total).toBe(4);
  expect(state.loaded).toBe(2);
  expect(state.failed).toBe(2);
  expect(state.pending).toBe(0);
  expect(state.percentLoaded).toBe(50);
  expect(state.isComplete).toBe(true);
  expect(state.isSuccess).toBe(false);
});

test('getTileLoadingState#tiles still loading', () => {
  const layer = new TileLayer({
    id: 'test-layer',
    data: 'https://example.com/tiles/{z}/{x}/{y}',
    getTileData: async () => TEST_DATA
  });

  // Mock tileset with loading tiles
  layer.state = {
    tileset: {
      selectedTiles: [
        {isLoaded: true, content: TEST_DATA},   // Loaded
        {isLoaded: false, content: null},        // Still loading
        {isLoaded: false, content: null},        // Still loading
        {isLoaded: true, content: null}          // Failed
      ]
    }
  } as any;

  const state = getTileLoadingState(layer);

  expect(state.total).toBe(4);
  expect(state.loaded).toBe(1);
  expect(state.failed).toBe(1);
  expect(state.pending).toBe(2);
  expect(state.percentLoaded).toBe(25);
  expect(state.isComplete).toBe(false);
  expect(state.isSuccess).toBe(false);
});

test('getTileLoadingState#all tiles failed', () => {
  const layer = new TileLayer({
    id: 'test-layer',
    data: 'https://example.com/tiles/{z}/{x}/{y}',
    getTileData: async () => {
      throw new Error('Network error');
    }
  });

  // Mock tileset where all tiles failed
  layer.state = {
    tileset: {
      selectedTiles: [
        {isLoaded: true, content: null},  // Failed
        {isLoaded: true, content: null},  // Failed
        {isLoaded: true, content: null}   // Failed
      ]
    }
  } as any;

  const state = getTileLoadingState(layer);

  expect(state.total).toBe(3);
  expect(state.loaded).toBe(0);
  expect(state.failed).toBe(3);
  expect(state.pending).toBe(0);
  expect(state.percentLoaded).toBe(0);
  expect(state.isComplete).toBe(true);
  expect(state.isSuccess).toBe(false);
});
