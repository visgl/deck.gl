import test from 'tape-promise/tape';
import {TileLayer} from '@deck.gl/geo-layers';
import {getTileLoadingState} from '@deck.gl/geo-layers/tile-layer/get-tile-loading-state';

const TEST_DATA = [
  {position: [0, 0]},
  {position: [1, 1]}
];

test('getTileLoadingState#empty layer', t => {
  const layer = new TileLayer({
    data: 'https://example.com/tiles/{z}/{x}/{y}',
    getTileData: () => null
  });

  const state = getTileLoadingState(layer);

  t.equal(state.total, 0, 'total is 0 for empty layer');
  t.equal(state.loaded, 0, 'loaded is 0');
  t.equal(state.failed, 0, 'failed is 0');
  t.equal(state.pending, 0, 'pending is 0');
  t.equal(state.percentLoaded, 100, 'percentLoaded is 100 for empty');
  t.equal(state.isComplete, true, 'isComplete is true');
  t.equal(state.isSuccess, true, 'isSuccess is true');

  t.end();
});

test('getTileLoadingState#all tiles loaded successfully', t => {
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

  t.equal(state.total, 3, 'total is 3');
  t.equal(state.loaded, 3, 'loaded is 3');
  t.equal(state.failed, 0, 'failed is 0');
  t.equal(state.pending, 0, 'pending is 0');
  t.equal(state.percentLoaded, 100, 'percentLoaded is 100');
  t.equal(state.isComplete, true, 'isComplete is true');
  t.equal(state.isSuccess, true, 'isSuccess is true');

  t.end();
});

test('getTileLoadingState#some tiles failed', t => {
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

  t.equal(state.total, 4, 'total is 4');
  t.equal(state.loaded, 2, 'loaded is 2');
  t.equal(state.failed, 2, 'failed is 2');
  t.equal(state.pending, 0, 'pending is 0');
  t.equal(state.percentLoaded, 50, 'percentLoaded is 50');
  t.equal(state.isComplete, true, 'isComplete is true (all settled)');
  t.equal(state.isSuccess, false, 'isSuccess is false (some failed)');

  t.end();
});

test('getTileLoadingState#tiles still loading', t => {
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

  t.equal(state.total, 4, 'total is 4');
  t.equal(state.loaded, 1, 'loaded is 1');
  t.equal(state.failed, 1, 'failed is 1');
  t.equal(state.pending, 2, 'pending is 2');
  t.equal(state.percentLoaded, 25, 'percentLoaded is 25 (1/4)');
  t.equal(state.isComplete, false, 'isComplete is false (pending tiles)');
  t.equal(state.isSuccess, false, 'isSuccess is false (not complete)');

  t.end();
});

test('getTileLoadingState#all tiles failed', t => {
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

  t.equal(state.total, 3, 'total is 3');
  t.equal(state.loaded, 0, 'loaded is 0');
  t.equal(state.failed, 3, 'failed is 3');
  t.equal(state.pending, 0, 'pending is 0');
  t.equal(state.percentLoaded, 0, 'percentLoaded is 0');
  t.equal(state.isComplete, true, 'isComplete is true (all settled)');
  t.equal(state.isSuccess, false, 'isSuccess is false (all failed)');

  // This demonstrates the behavior: layer.isLoaded would return true
  // because all tiles are "settled", but isSuccess is false
  t.equal(layer.isLoaded, true, 'layer.isLoaded is true even though all failed');
  t.equal(state.isSuccess, false, 'but isSuccess correctly identifies failure');

  t.end();
});
