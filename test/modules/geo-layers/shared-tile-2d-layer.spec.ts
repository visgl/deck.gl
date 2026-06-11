// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {OrthographicViewport, WebMercatorViewport} from '@deck.gl/core';
import {
  _SharedTile2DLayer as SharedTile2DLayer,
  _SharedTileset2D as SharedTileset2D,
  sharedTile2DDeckAdapter,
  type SharedTileset2DAdapter
} from '@deck.gl/geo-layers';
import type {TileSource} from '@loaders.gl/loader-utils';
import {describe, expect, it} from 'vitest';

import {SharedTile2DView} from '../../../modules/geo-layers/src/shared-tile-2d-layer/shared-tile-2d-view';

const mockTilesetAdapter: SharedTileset2DAdapter<string> = {
  getTileIndices: () => [],
  getTileBoundingBox: (_context, index) => ({
    left: index.x,
    top: index.y,
    right: index.x + 1,
    bottom: index.y + 1
  })
};

type TestTileData = Array<{tileId: string}> & {byteLength?: number};

function createMockTileSource(
  overrides: Partial<TileSource> & {
    getMetadata?: TileSource['getMetadata'];
    getTileData?: TileSource['getTileData'];
  } = {}
): TileSource {
  return {
    getMetadata: () =>
      Promise.resolve({
        minZoom: 1,
        maxZoom: 4,
        boundingBox: [
          [-10, -20],
          [30, 40]
        ]
      }),
    getTile: () => Promise.resolve(null),
    getTileData: ({id}) => {
      const result = [{tileId: id}] as TestTileData;
      result.byteLength = 16;
      return Promise.resolve(result);
    },
    ...overrides
  };
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(resolvePromise => {
    resolve = resolvePromise;
  });
  return {promise, resolve};
}

async function waitFor(condition: () => boolean, message: string): Promise<void> {
  for (let i = 0; i < 50; i++) {
    if (condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  throw new Error(message);
}

describe('SharedTile2DLayer', () => {
  it('exports from the package surface', () => {
    expect(SharedTile2DLayer).toBeDefined();
    expect(SharedTileset2D).toBeDefined();
    expect(sharedTile2DDeckAdapter).toBeDefined();
  });

  it('builds URL-template requests through the layer path', () => {
    let requestedUrl: string | undefined | null;
    const layer = new SharedTile2DLayer({
      id: 'shared-tile-url-template',
      data: 'https://example.com/{z}/{x}/{y}.json',
      getTileData: tile => {
        requestedUrl = tile.url;
        return null;
      }
    });

    const tileData = layer.getTileData({
      index: {x: 3, y: 5, z: 2},
      id: '3-5-2',
      bbox: {west: 0, south: 0, east: 1, north: 1},
      zoom: 2
    });

    expect(tileData).toBeNull();
    expect(requestedUrl).toBe('https://example.com/2/3/5.json');
  });

  it('adopts TileSource metadata with explicit overrides winning', async () => {
    const tileset = SharedTileset2D.fromTileSource(createMockTileSource(), {minZoom: 2});
    await waitFor(() => tileset.maxZoom === 4, 'expected TileSource metadata to resolve');
    expect(tileset.minZoom).toBe(2);
    expect(tileset.maxZoom).toBe(4);
    expect((tileset as any).opts.extent).toEqual([-10, -20, 30, 40]);
    tileset.finalize();
  });

  it('ignores stale TileSource metadata after the source changes', async () => {
    const firstMetadata = createDeferred<any>();
    const secondMetadata = createDeferred<any>();
    const firstSource = createMockTileSource({getMetadata: () => firstMetadata.promise});
    const secondSource = createMockTileSource({getMetadata: () => secondMetadata.promise});
    const tileset = SharedTileset2D.fromTileSource(firstSource);

    tileset.setOptions({tileSource: secondSource});
    secondMetadata.resolve({
      minZoom: 2,
      maxZoom: 8,
      boundingBox: [
        [0, 0],
        [1, 1]
      ]
    });
    await waitFor(() => tileset.maxZoom === 8, 'expected second TileSource metadata to resolve');

    firstMetadata.resolve({
      minZoom: 1,
      maxZoom: 4,
      boundingBox: [
        [-1, -1],
        [1, 1]
      ]
    });
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(tileset.minZoom).toBe(2);
    expect(tileset.maxZoom).toBe(8);
    expect((tileset as any).opts.extent).toEqual([0, 0, 1, 1]);
    tileset.finalize();
  });

  it('accepts TileSource data in SharedTile2DLayer options', () => {
    const source = createMockTileSource();
    const layer = new SharedTile2DLayer({
      id: 'shared-tile-source',
      data: source
    });

    const tilesetOptions = (layer as any)._getTilesetOptions();
    expect(tilesetOptions.tileSource).toBe(source);
    expect(tilesetOptions.getTileData).toBeUndefined();
    expect(tilesetOptions).not.toHaveProperty('minZoom');
    expect(tilesetOptions).not.toHaveProperty('maxZoom');
  });

  it('shares one SharedTileset2D across multiple consumers and views', async () => {
    const sharedTileset = SharedTileset2D.fromTileSource<TestTileData>(createMockTileSource());
    const leftView = new SharedTile2DView(sharedTileset);
    const rightView = new SharedTile2DView(sharedTileset);
    let statsChangeCount = 0;
    const unsubscribe = sharedTileset.subscribe({
      onStatsChange: () => {
        statsChangeCount++;
      }
    });

    const leftViewport = new OrthographicViewport({
      id: 'left',
      width: 200,
      height: 200,
      target: [100, 100],
      zoom: 1
    });
    const rightViewport = new OrthographicViewport({
      id: 'right',
      width: 200,
      height: 200,
      target: [500, 500],
      zoom: 1
    });

    try {
      leftView.update(leftViewport);
      rightView.update(rightViewport);

      await waitFor(
        () => Boolean(leftView.isLoaded && rightView.isLoaded),
        'expected both views to finish loading shared tiles'
      );
      leftView.update(leftViewport);
      rightView.update(rightViewport);

      const leftTileIds = new Set(leftView.selectedTiles?.map(tile => tile.id));
      const rightTileIds = new Set(rightView.selectedTiles?.map(tile => tile.id));

      expect(leftTileIds.size).toBeGreaterThan(0);
      expect(rightTileIds.size).toBeGreaterThan(0);
      expect([...leftTileIds].some(id => !rightTileIds.has(id))).toBe(true);
      expect(sharedTileset.tiles.length).toBeGreaterThanOrEqual(
        leftTileIds.size + rightTileIds.size - 1
      );
      expect(sharedTileset.visibleTiles.some(tile => leftTileIds.has(tile.id))).toBe(true);
      expect(sharedTileset.visibleTiles.some(tile => rightTileIds.has(tile.id))).toBe(true);
      expect(sharedTileset.stats.get('Visible Tiles').count).toBe(
        sharedTileset.visibleTiles.length
      );
      expect(sharedTileset.stats.get('Tiles In Cache').count).toBe(sharedTileset.tiles.length);
      expect(sharedTileset.stats.get('Cache Size').count).toBeGreaterThan(0);
      expect(sharedTileset.stats.get('Consumers').count).toBe(2);
      expect(statsChangeCount).toBeGreaterThan(0);

      leftView.finalize();
      rightView.update(rightViewport);
      expect(rightView.selectedTiles?.length).toBeGreaterThan(0);
    } finally {
      unsubscribe();
      rightView.finalize();
      sharedTileset.finalize();
    }
  });

  it('evicts least recently used non-visible tiles once the cache exceeds the high-water mark', () => {
    const tileset = new SharedTileset2D({
      getTileData: () => null,
      maxCacheSize: 2,
      adapter: mockTilesetAdapter
    });
    tileset.getTileIndices({viewState: 'cache-test', zRange: null});

    const consumerId = Symbol('consumer');
    tileset.attachConsumer(consumerId);

    const tile1 = tileset.getTile({x: 0, y: 0, z: 1}, true);
    const tile2 = tileset.getTile({x: 1, y: 0, z: 1}, true);
    tileset.updateConsumer(consumerId, [tile1, tile2], [tile1, tile2]);

    tileset.getTile({x: 0, y: 0, z: 1}, true);

    const tile3 = tileset.getTile({x: 0, y: 1, z: 1}, true);
    tileset.updateConsumer(consumerId, [tile3], [tile3]);

    expect(tileset.tiles.map(tile => tile.id)).toContain('0-0-1');
    expect(tileset.tiles.map(tile => tile.id)).toContain('0-1-1');
    expect(tileset.tiles.map(tile => tile.id)).not.toContain('1-0-1');
    expect(tileset.stats.get('Tiles In Cache').count).toBe(2);
    expect(tileset.stats.get('Unloaded Tiles').count).toBe(1);

    tileset.detachConsumer(consumerId);
    tileset.finalize();
  });

  it('throws if traversal is requested without an adapter', () => {
    const tileset = new SharedTileset2D({
      getTileData: () => null
    });

    expect(() =>
      tileset.getTileIndices({
        viewState: 'missing-adapter',
        zRange: null
      })
    ).toThrow('SharedTileset2D requires an adapter before tile traversal can be used.');

    tileset.finalize();
  });

  it('does not finalize an external shared tileset when the layer finalizes', async () => {
    const sharedTileset = SharedTileset2D.fromTileSource<TestTileData>(createMockTileSource());
    const layer = new SharedTile2DLayer({
      id: 'shared-tile-external-tileset',
      data: sharedTileset
    });
    const externalView = new SharedTile2DView(sharedTileset);
    const viewport = new WebMercatorViewport({
      width: 256,
      height: 256,
      longitude: 0,
      latitude: 0,
      zoom: 2
    });

    externalView.update(viewport);
    await waitFor(
      () => externalView.isLoaded,
      'expected shared tileset to load before finalization'
    );

    (layer as any).state = {
      tileset: sharedTileset,
      tilesetViews: new Map(),
      ownsTileset: false,
      isLoaded: false,
      frameNumbers: new Map(),
      tileLayers: new Map(),
      unsubscribeTilesetEvents: null
    };

    layer.finalizeState();

    externalView.update(viewport);
    expect(sharedTileset.tiles.length).toBeGreaterThan(0);

    externalView.finalize();
    sharedTileset.finalize();
  });

  it('requests an update when a new viewport is activated', () => {
    const layer = new SharedTile2DLayer({
      id: 'shared-tile-activate-viewport',
      data: createMockTileSource()
    });
    let updatesRequested = 0;
    (layer as any).setNeedsUpdate = () => {
      updatesRequested++;
    };

    const minimapViewport = new WebMercatorViewport({
      id: 'minimap',
      width: 256,
      height: 256,
      longitude: 0,
      latitude: 0,
      zoom: 2
    });

    layer.activateViewport(minimapViewport);
    expect(updatesRequested).toBe(1);

    layer.activateViewport(minimapViewport);
    expect(updatesRequested).toBe(1);
  });

  it('settles errored tile loads so the view can finish loading', async () => {
    let errors = 0;
    const tileset = new SharedTileset2D({
      adapter: sharedTile2DDeckAdapter,
      getTileData: async () => {
        throw new Error('expected tile error');
      },
      onTileError: () => {
        errors++;
      }
    });
    const view = new SharedTile2DView(tileset);
    const viewport = new WebMercatorViewport({
      width: 256,
      height: 256,
      longitude: 0,
      latitude: 0,
      zoom: 2
    });

    view.update(viewport);
    await waitFor(() => view.isLoaded, 'expected errored tiles to settle');

    expect(errors).toBeGreaterThan(0);
    expect(view.selectedTiles?.every(tile => tile.isLoaded && tile.content === null)).toBe(true);

    view.finalize();
    tileset.finalize();
  });

  it('honors visible zoom bounds during shared traversal', () => {
    const tileset = new SharedTileset2D({
      adapter: sharedTile2DDeckAdapter,
      getTileData: () => null,
      visibleMinZoom: 2
    });
    const view = new SharedTile2DView(tileset);
    const viewport = new WebMercatorViewport({
      width: 256,
      height: 256,
      longitude: 0,
      latitude: 0,
      zoom: 1
    });

    view.update(viewport);
    expect(view.selectedTiles).toEqual([]);
    expect(tileset.tiles).toEqual([]);

    view.finalize();
    tileset.finalize();
  });
});
