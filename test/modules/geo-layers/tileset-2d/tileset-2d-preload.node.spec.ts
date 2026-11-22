// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {WebMercatorViewport} from '@deck.gl/core';
import {Tileset2D} from '@deck.gl/geo-layers';
import {Tile2DView} from '../../../../modules/geo-layers/src/tileset-2d/tile-2d-view';

const CURRENT = new WebMercatorViewport({
  width: 256,
  height: 256,
  longitude: 0,
  latitude: 0,
  zoom: 3
});
const TARGET = new WebMercatorViewport({
  width: 256,
  height: 256,
  longitude: 40,
  latitude: 20,
  zoom: 6
});

type Request = {id: string; signal?: AbortSignal; resolve: () => void};

/** A tileset whose loads stay pending until the test resolves them. */
function makeTileset(opts: Record<string, any> = {}) {
  const requests: Request[] = [];
  const tileset = new Tileset2D({
    getTileData: ({id, signal}) =>
      new Promise<any>(resolve => {
        requests.push({id, signal, resolve: () => resolve({byteLength: 1})});
      }),
    ...opts
  });
  return {tileset, requests};
}

function getIds(tileset: Tileset2D, viewport: WebMercatorViewport): string[] {
  return tileset
    .getTileIndices({viewport, zRange: null, maxZoom: tileset.maxZoom, minZoom: tileset.minZoom})
    .map(index => tileset.getTileId(index));
}

const ids = (tiles: {id: string}[] | null) => (tiles || []).map(tile => tile.id).sort();

async function settle() {
  await new Promise(resolve => setTimeout(resolve, 10));
}

test.each(['default', 'independent'] as const)(
  'Tileset2D preload: %s consumer requests the target tiles first without selecting them',
  async consumer => {
    const {tileset, requests} = makeTileset({maxRequests: 1});
    const view = consumer === 'independent' ? new Tile2DView(tileset) : null;
    const targetIds = getIds(tileset, TARGET);
    const currentIds = getIds(tileset, CURRENT);
    expect(
      targetIds.some(id => currentIds.includes(id)),
      'disjoint sets'
    ).toBe(false);

    (view || tileset).update(CURRENT, {zRange: null, modelMatrix: null, preloadViewport: TARGET});
    await settle();

    expect(
      requests.map(r => r.id),
      'one slot, given to the first target tile'
    ).toEqual([targetIds[0]]);
    expect(ids((view || tileset).selectedTiles), 'selection is the current view').toEqual(
      [...currentIds].sort()
    );
    for (const tile of tileset.tiles.filter(t => targetIds.includes(t.id))) {
      expect(tile.isSelected, `${tile.id} not selected`).toBe(false);
      expect((view || tileset).isTileVisible(tile), `${tile.id} not visible`).toBe(false);
    }

    // The preload set drains before the selected tiles, in index order.
    for (let i = 0; i < targetIds.length + currentIds.length; i++) {
      requests[i].resolve();
      await settle();
    }
    expect(requests.map(r => r.id)).toEqual([...targetIds, ...currentIds]);
    view?.finalize();
  }
);

test('Tileset2D preload: without a preload viewport the selected tiles load first', async () => {
  const {tileset, requests} = makeTileset({maxRequests: 1});
  tileset.update(CURRENT, {zRange: null, modelMatrix: null, preloadViewport: null});
  await settle();
  expect(getIds(tileset, CURRENT)).toContain(requests[0].id);
  expect(tileset.tiles.length, 'no target tiles in the cache').toBe(
    getIds(tileset, CURRENT).length
  );
});

test('Tileset2D preload: the set is capped by the tile-count limit of the cache', () => {
  const {tileset: probe} = makeTileset();
  const currentIds = getIds(probe, CURRENT);
  const targetIds = getIds(probe, TARGET);
  expect(targetIds.length).toBeGreaterThan(1);

  const maxCacheSize = currentIds.length + 1;
  const {tileset} = makeTileset({maxCacheSize});
  tileset.update(CURRENT, {zRange: null, modelMatrix: null, preloadViewport: TARGET});
  const cached = tileset.tiles.map(tile => tile.id);
  expect(
    targetIds.filter(id => cached.includes(id)),
    'first target tile only'
  ).toEqual(targetIds.slice(0, 1));
  expect(tileset.tiles.length).toBe(maxCacheSize);
});

test('Tileset2D preload: queued and loading preload tiles are not aborted', async () => {
  const {tileset, requests} = makeTileset({maxRequests: 2});
  tileset.update(CURRENT, {zRange: null, modelMatrix: null, preloadViewport: TARGET});
  await settle();
  const targetIds = getIds(tileset, TARGET);
  expect(requests.map(r => r.id)).toEqual(targetIds.slice(0, 2));

  // Move the current view: more selected tiles than slots, so pruning runs.
  const moved = new WebMercatorViewport({...CURRENT, longitude: -60});
  tileset.update(moved, {zRange: null, modelMatrix: null, preloadViewport: TARGET});
  await settle();
  expect(
    requests.some(r => r.signal?.aborted),
    'no preload request aborted'
  ).toBe(false);
  for (const tile of tileset.tiles.filter(t => targetIds.includes(t.id))) {
    expect(tile.isLoading || tile.isLoaded, `${tile.id} still requested`).toBe(true);
  }
});

test('Tileset2D preload: loaded preload tiles survive eviction until the set clears', async () => {
  const unloaded: string[] = [];
  const {tileset, requests} = makeTileset({
    maxCacheSize: 8,
    onTileUnload: tile => unloaded.push(tile.id)
  });
  const targetIds = getIds(tileset, TARGET);
  const firstVisitIds = getIds(tileset, new WebMercatorViewport({...CURRENT, longitude: -120}));
  tileset.update(CURRENT, {zRange: null, modelMatrix: null, preloadViewport: TARGET});
  await settle();
  requests.forEach(r => r.resolve());
  await settle();

  // Visit other places; each visit adds new selected tiles and overflows the cache.
  for (const longitude of [-120, -60, 100, 150]) {
    const viewport = new WebMercatorViewport({...CURRENT, longitude});
    tileset.update(viewport, {zRange: null, modelMatrix: null, preloadViewport: TARGET});
    await settle();
    requests.forEach(r => r.resolve());
    await settle();
  }
  const cached = () => tileset.tiles.map(tile => tile.id);
  expect(
    firstVisitIds.every(id => unloaded.includes(id)),
    'eviction ran'
  ).toBe(true);
  expect(
    targetIds.filter(id => unloaded.includes(id)),
    'no target tile evicted'
  ).toEqual([]);
  expect(
    targetIds.every(id => cached().includes(id)),
    'target tiles kept'
  ).toBe(true);

  // Interrupt: the preload set clears and the target tiles become ordinary unused tiles.
  for (const longitude of [-150, -90, 60, 120, -30, 30]) {
    const viewport = new WebMercatorViewport({...CURRENT, longitude});
    tileset.update(viewport, {zRange: null, modelMatrix: null, preloadViewport: null});
    await settle();
    requests.forEach(r => r.resolve());
    await settle();
  }
  expect(
    targetIds.every(id => unloaded.includes(id)),
    'target tiles evicted'
  ).toBe(true);
  expect(targetIds.some(id => cached().includes(id))).toBe(false);
});

test('Tileset2D preload: a cleared set cancels the queued preload requests', async () => {
  const {tileset, requests} = makeTileset({maxRequests: 1});
  const targetIds = getIds(tileset, TARGET);
  const currentIds = getIds(tileset, CURRENT);
  tileset.update(CURRENT, {zRange: null, modelMatrix: null, preloadViewport: TARGET});
  await settle();
  expect(requests.map(r => r.id)).toEqual([targetIds[0]]);

  tileset.update(CURRENT, {zRange: null, modelMatrix: null, preloadViewport: null});
  await settle();
  requests[0].resolve();
  await vi.waitFor(() => expect(requests.length).toBeGreaterThan(1));
  for (let i = 1; i <= currentIds.length; i++) {
    await vi.waitFor(() => expect(requests.length).toBeGreaterThan(i));
    requests[i].resolve();
  }
  await settle();
  expect(
    requests.slice(1).map(r => r.id),
    'only the selected tiles load after the clear'
  ).toEqual(currentIds);
  const queued = tileset.tiles.filter(t => targetIds.slice(1).includes(t.id));
  expect(
    queued.every(tile => !tile.isLoaded),
    'queued preload tiles never loaded'
  ).toBe(true);
});

test('Tileset2D preload: visible placeholders do not push preload tiles out of the cache', async () => {
  const zoomed = new WebMercatorViewport({...CURRENT, zoom: 4});
  const {tileset: probe} = makeTileset();
  const currentIds = getIds(probe, CURRENT);
  const zoomedIds = getIds(probe, zoomed);
  const targetIds = getIds(probe, TARGET);
  expect(targetIds.length).toBeGreaterThan(1);
  // Room for the selected tiles, their placeholders and one preload tile.
  const maxCacheSize = zoomedIds.length + currentIds.length + 1;
  const unloaded: string[] = [];
  const {tileset, requests} = makeTileset({
    maxCacheSize,
    refinementStrategy: 'best-available',
    onTileUnload: tile => unloaded.push(tile.id)
  });
  tileset.update(CURRENT, {zRange: null, modelMatrix: null});
  await settle();
  requests.forEach(r => r.resolve());
  await settle();

  // Zoom in: the new tiles are not loaded, so the loaded parents stay visible as placeholders.
  tileset.update(zoomed, {zRange: null, modelMatrix: null, preloadViewport: TARGET});
  await settle();
  const placeholders = tileset.tiles.filter(t => t.isVisible && currentIds.includes(t.id));
  expect(placeholders.length, 'placeholders exist').toBe(currentIds.length);

  expect(
    targetIds.filter(id => unloaded.includes(id)),
    'no preload tile evicted'
  ).toEqual([]);
  expect(
    requests.filter(r => r.signal?.aborted).map(r => r.id),
    'no request aborted'
  ).toEqual([]);
  expect(
    targetIds.filter(id => tileset.tiles.some(t => t.id === id)),
    'the preload set shrinks to the best tile'
  ).toEqual(targetIds.slice(0, 1));
  expect(tileset.tiles.length).toBeLessThanOrEqual(maxCacheSize);
});

test('Tileset2D preload: a second consumer does not evict the preload tiles of the first', async () => {
  const other = new WebMercatorViewport({...TARGET, longitude: -40});
  const {tileset: probe} = makeTileset();
  const currentIds = getIds(probe, CURRENT);
  const targetIds = getIds(probe, TARGET);
  const otherIds = getIds(probe, other);
  expect(otherIds.some(id => targetIds.includes(id) || currentIds.includes(id))).toBe(false);

  const unloaded: string[] = [];
  const {tileset, requests} = makeTileset({
    maxCacheSize: currentIds.length + targetIds.length,
    onTileUnload: tile => unloaded.push(tile.id)
  });
  const first = new Tile2DView(tileset);
  const second = new Tile2DView(tileset);
  first.update(CURRENT, {zRange: null, modelMatrix: null, preloadViewport: TARGET});
  second.update(CURRENT, {zRange: null, modelMatrix: null, preloadViewport: other});
  await settle();

  expect(
    requests.filter(r => r.signal?.aborted).map(r => r.id),
    'no preload request aborted'
  ).toEqual([]);
  expect(
    targetIds.filter(id => unloaded.includes(id)),
    'first consumer keeps its preload tiles'
  ).toEqual([]);
  expect(
    targetIds.every(id => tileset.tiles.some(t => t.id === id)),
    'first preload set cached'
  ).toBe(true);
  expect(
    otherIds.filter(id => tileset.tiles.some(t => t.id === id)),
    'no room for the second preload set'
  ).toEqual([]);
  first.finalize();
  second.finalize();
});

test('Tileset2D preload: the preload set shrinks, best tiles first, when other views need the cache', async () => {
  const other = new WebMercatorViewport({...TARGET, longitude: -40});
  const {tileset: probe} = makeTileset();
  const currentIds = getIds(probe, CURRENT);
  const targetIds = getIds(probe, TARGET);
  const otherIds = getIds(probe, other);
  expect(targetIds.length).toBeGreaterThan(1);

  // Room for both views' selected tiles and one preload tile.
  const maxCacheSize = currentIds.length + otherIds.length + 1;
  const {tileset} = makeTileset({maxCacheSize});
  const first = new Tile2DView(tileset);
  const second = new Tile2DView(tileset);
  first.update(CURRENT, {zRange: null, modelMatrix: null, preloadViewport: TARGET});
  expect(
    targetIds.every(id => tileset.tiles.some(t => t.id === id)),
    'room for the whole set at first'
  ).toBe(true);

  second.update(other, {zRange: null, modelMatrix: null});
  await settle();
  const cached = tileset.tiles.map(tile => tile.id);
  expect(
    otherIds.every(id => cached.includes(id)),
    'the selected tiles of the second view are kept'
  ).toBe(true);
  expect(
    targetIds.filter(id => cached.includes(id)),
    'the best preload tile is kept'
  ).toEqual(targetIds.slice(0, 1));
  expect(tileset.tiles.length).toBeLessThanOrEqual(maxCacheSize);
  first.finalize();
  second.finalize();
});
