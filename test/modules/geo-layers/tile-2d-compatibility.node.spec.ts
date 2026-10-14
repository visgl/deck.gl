// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, expect, it, vi} from 'vitest';
import {COORDINATE_SYSTEM, WebMercatorViewport} from '@deck.gl/core';
import {
  Tileset2D,
  _Tileset2D,
  MVT2DLayer,
  Tile2DLayer,
  tile2DDeckAdapter
} from '@deck.gl/geo-layers';
import {Tile2DView} from '../../../modules/geo-layers/src/tileset-2d/tile-2d-view';

const viewport = (zoom = 4, longitude = 0) =>
  new WebMercatorViewport({
    id: 'main',
    width: 256,
    height: 256,
    latitude: 0,
    longitude,
    zoom
  });

describe('Tileset2D compatibility and independent consumers', () => {
  it('uses one class and cache for legacy updates and new consumers', async () => {
    expect(Tileset2D).toBe(_Tileset2D);
    const getTileData = vi.fn(async ({id}) => ({id, byteLength: 16}));
    const tileset = new Tileset2D({getTileData});
    const view = new Tile2DView(tileset);
    try {
      tileset.update(viewport());
      view.update(viewport());
      await vi.waitFor(() => expect(view.isLoaded && tileset.isLoaded).toBe(true));
      tileset.update(viewport());
      view.update(viewport());
      expect(getTileData).toHaveBeenCalledTimes(tileset.selectedTiles!.length);
      expect(view.selectedTiles![0]).toBe(tileset.selectedTiles![0]);
      expect(tileset.tiles.some(tile => tile.isVisible)).toBe(true);
      expect(new Tile2DLayer({data: tileset}).props.data).toBe(tileset);
      expect(new MVT2DLayer({data: tileset}).props.data).toBe(tileset);
    } finally {
      view.finalize();
      tileset.finalize();
    }
  });

  it.each(['best-available', 'no-overlap', 'never'] as const)(
    'renders loaded selected tiles with %s refinement',
    async refinementStrategy => {
      const tileset = new Tileset2D({getTileData: async () => [], refinementStrategy});
      const view = new Tile2DView(tileset);
      try {
        view.update(viewport());
        await vi.waitFor(() => expect(view.isLoaded).toBe(true));
        view.update(viewport());
        expect(view.selectedTiles!.every(tile => view.isTileVisible(tile))).toBe(true);
      } finally {
        view.finalize();
        tileset.finalize();
      }
    }
  );

  it('reselects a stationary view after options and metadata resolve', async () => {
    let resolveMetadata!: (metadata: any) => void;
    const tileset = Tileset2D.fromTileSource({
      getMetadata: () =>
        new Promise(resolve => {
          resolveMetadata = resolve;
        }),
      getTile: async () => null,
      getTileData: async () => []
    });
    const view = new Tile2DView(tileset);
    try {
      const fixedViewport = viewport(5);
      view.update(fixedViewport);
      expect(view.selectedTiles![0].zoom).toBe(5);
      resolveMetadata({maxZoom: 2});
      await vi.waitFor(() => expect(tileset.maxZoom).toBe(2));
      view.update(fixedViewport);
      expect(view.selectedTiles!.every(tile => tile.zoom === 2)).toBe(true);
      tileset.setOptions({maxZoom: 3});
      view.update(fixedViewport);
      expect(view.selectedTiles!.every(tile => tile.zoom === 3)).toBe(true);
    } finally {
      view.finalize();
      tileset.finalize();
    }
  });

  it.each(['best-available', 'no-overlap', 'never'] as const)(
    'matches compatibility fallback selection across zoom transitions with %s',
    async refinementStrategy => {
      const pending: Array<() => void> = [];
      const allowed = new Set([4]);
      const getTileData = ({index}: any) =>
        allowed.has(index.z)
          ? Promise.resolve([])
          : new Promise<any[]>(resolve => pending.push(() => resolve([])));
      const legacy = new Tileset2D({getTileData, refinementStrategy});
      const shared = new Tileset2D({getTileData, refinementStrategy});
      const view = new Tile2DView(shared);
      const assertParity = (nextViewport: WebMercatorViewport) => {
        legacy.update(nextViewport);
        view.update(nextViewport);
        const legacyIds = legacy.tiles
          .filter(tile => legacy.isTileVisible(tile))
          .map(tile => tile.id)
          .sort();
        const sharedIds = shared.tiles
          .filter(tile => view.isTileVisible(tile))
          .map(tile => tile.id)
          .sort();
        expect(sharedIds).toEqual(legacyIds);
      };
      try {
        assertParity(viewport(4));
        await vi.waitFor(() => expect(legacy.isLoaded && view.isLoaded).toBe(true));
        assertParity(viewport(4));
        assertParity(viewport(5));
        await vi.waitFor(() => expect(pending.length).toBeGreaterThan(0));
        allowed.add(5);
        pending.splice(0).forEach(resolve => resolve());
        await vi.waitFor(() => expect(legacy.isLoaded && view.isLoaded).toBe(true));
        assertParity(viewport(5));
        assertParity(viewport(3));
        await vi.waitFor(() => expect(pending.length).toBeGreaterThan(0));
        allowed.add(3);
        pending.splice(0).forEach(resolve => resolve());
        await vi.waitFor(() => expect(legacy.isLoaded && view.isLoaded).toBe(true));
        assertParity(viewport(3));
      } finally {
        view.finalize();
        legacy.finalize();
        shared.finalize();
      }
    }
  );

  it('isolates callback refinement flags between views and the default consumer', async () => {
    const tileset = new Tileset2D({getTileData: async () => []});
    const first = new Tile2DView(tileset);
    const second = new Tile2DView(tileset);
    try {
      first.update(viewport());
      second.update(viewport());
      await vi.waitFor(() => expect(first.isLoaded).toBe(true));
      second.update(viewport());
      const tile = second.selectedTiles![0];
      tileset.setOptions({
        refinementStrategy: tiles => {
          for (const t of tiles) t.isVisible = false;
        }
      });
      first.update(viewport());
      expect(first.isTileVisible(tile)).toBe(false);
      expect(second.isTileVisible(tile)).toBe(true);
      expect(tile.isVisible).toBe(false);
    } finally {
      first.finalize();
      second.finalize();
      tileset.finalize();
    }
  });

  it('releases view references to evicted tiles and reports current cache stats', async () => {
    const tileset = new Tileset2D({getTileData: async () => ({byteLength: 16}), maxCacheSize: 4});
    const view = new Tile2DView(tileset);
    try {
      for (let i = 0; i < 12; i++) {
        const nextViewport = viewport(8, i * 10);
        view.update(nextViewport);
        await vi.waitFor(() => expect(view.isLoaded).toBe(true));
        view.update(nextViewport);
      }
      expect((view as any)._state.size).toBeLessThanOrEqual(tileset.tiles.length);
      expect(tileset.stats.get('Tiles In Cache').count).toBe(tileset.tiles.length);
      expect(tileset.stats.get('Unloaded Tiles').count).toBeGreaterThan(0);
      expect(tileset.cacheByteSize).toBe(tileset.tiles.length * 16);
    } finally {
      view.finalize();
      tileset.finalize();
    }
  });

  it('shares tile selection with the standard adapter, including fractional offsets', () => {
    const tileset = new Tileset2D({getTileData: async () => [], zoomOffset: -0.5});
    const fixedViewport = viewport(3.5);
    const context = {viewState: fixedViewport, tileSize: 512, zRange: null, zoomOffset: -0.5};
    expect(tile2DDeckAdapter.getTileIndices(context)).toEqual(
      tileset.getTileIndices({viewport: fixedViewport, zRange: null})
    );
    tileset.finalize();
  });

  it('detaches removed views and emits each viewport load once', async () => {
    const tileset = new Tileset2D({getTileData: async () => []});
    const main = viewport(4);
    const mini = new WebMercatorViewport({
      id: 'mini',
      width: 256,
      height: 256,
      latitude: 0,
      longitude: 90,
      zoom: 2
    });
    let active = [main, mini];
    const onViewportLoad = vi.fn();
    const layer = new Tile2DLayer({data: tileset, onViewportLoad});
    layer.context = {viewport: main, layerManager: {getViewports: () => active}} as any;
    layer.initializeState();
    layer.setState = (updates: any) => Object.assign(layer.state, updates);
    layer.setNeedsUpdate = vi.fn();
    try {
      layer.updateState({changeFlags: {dataChanged: true}} as any);
      await vi.waitFor(() => expect(layer.isLoaded).toBe(true));
      layer.updateState({changeFlags: {}} as any);
      expect(onViewportLoad).toHaveBeenCalledTimes(2);
      expect(tileset.stats.get('Consumers').count).toBe(2);
      active = [main];
      layer.updateState({changeFlags: {}} as any);
      expect(layer.state.tilesetViews.size).toBe(1);
      expect(tileset.stats.get('Consumers').count).toBe(1);
      expect(tileset.selectedTiles!.every(tile => tile.zoom === 4)).toBe(true);
    } finally {
      layer.finalizeState();
      tileset.finalize();
    }
  });

  it('uses geographic geometry for low-zoom extrusions and follows picked sublayer coordinates', () => {
    let captured: any;
    const layer = new MVT2DLayer({
      data: '',
      extruded: true,
      renderSubLayers: props => {
        captured = props;
        return null;
      }
    });
    layer.context = {viewport: viewport(3)} as any;
    const feature = {type: 'Feature', geometry: {type: 'Point', coordinates: [0.5, 0.5]}};
    const tile = {index: {x: 0, y: 0, z: 0}, bbox: {west: -180, south: -85, east: 180, north: 85}};
    layer.renderSubLayers({...layer.props, data: [feature], tile, id: 'tile', _offset: 0} as any);
    expect(captured.coordinateSystem).toBe(COORDINATE_SYSTEM.LNGLAT);
    expect(captured.data[0].geometry.coordinates).toEqual([0, 0]);
    const picked = layer.getPickingInfo({
      info: {object: captured.data[0]},
      sourceLayer: {props: {tile, coordinateSystem: COORDINATE_SYSTEM.LNGLAT}}
    } as any);
    expect(picked.object.geometry.coordinates).toEqual([0, 0]);
    expect(feature.geometry.coordinates).toEqual([0.5, 0.5]);
  });
});
