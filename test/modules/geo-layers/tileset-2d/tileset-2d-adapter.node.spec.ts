// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, expect, test, vi} from 'vitest';
import {WebMercatorViewport, type Viewport} from '@deck.gl/core';
import {Tileset2D, type Tileset2DAdapter} from '@deck.gl/geo-layers';
import {Matrix4} from '@math.gl/core/matrix';
import {Tile2DView} from '../../../../modules/geo-layers/src/tileset-2d/tile-2d-view';
import type {TileIndex} from '../../../../modules/geo-layers/src/tileset-2d/types';

/** View centered over the UTM zone 26 fixtures. */
const viewport = new WebMercatorViewport({
  longitude: -27,
  latitude: 38.9,
  zoom: 6,
  width: 800,
  height: 600
});

/** Two projected tiles with geographic footprints at different distances from the center. */
const projectedAdapter: Tileset2DAdapter<Viewport> = {
  getTileIndices: () => [
    {x: 0, y: 0, z: 6},
    {x: 1, y: 0, z: 6}
  ],
  getTileBoundingBox: (_context, {x}) => ({
    left: 480000 + x * 80000,
    top: 4320000,
    right: 520000 + x * 80000,
    bottom: 4280000
  }),
  getTileOutline: (_context, {x}) => {
    const west = -27.2 + x;
    const east = -26.8 + x;
    if (x === 0) {
      return [
        [west, 38.7],
        [east, 38.7],
        [-27, 39.1]
      ];
    }
    return [
      [west, 38.7],
      [east, 38.7],
      [east, 39.0],
      [(west + east) / 2, 39.1],
      [west, 39.0],
      [west, 38.7]
    ];
  }
};

/** Disposes shared views and tilesets after each test. */
const cleanups: (() => void)[] = [];
afterEach(() => cleanups.splice(0).forEach(cleanup => cleanup()));

test('Tileset2D uses adapter IDs, zoom, parents, and metadata in the cache', async () => {
  const parentIndex = {x: 9, y: 7, z: 0};
  const childIndex = {x: 2, y: 4, z: 0};
  const rootIndex = {x: 3, y: 4, z: 0};
  const bbox = {left: 10, top: 20, right: 30, bottom: 40};
  const getTileMetadata = vi.fn(() => ({bbox, crs: 'EPSG:32626', tileMatrix: 'custom'}));
  const getParentIndex = vi.fn((index: TileIndex) => (index === childIndex ? parentIndex : null));
  const tileset = new Tileset2D({
    adapter: {
      getTileIndices: () => [parentIndex, childIndex, rootIndex],
      getTileBoundingBox: projectedAdapter.getTileBoundingBox,
      getTileId: ({x}) => `custom-${x}`,
      getTileZoom: index => (index === parentIndex ? 3 : 5),
      getParentIndex,
      getTileMetadata
    },
    getTileData: () => [],
    refinementStrategy: 'best-available',
    tileSize: 256
  });
  cleanups.push(() => tileset.finalize());

  tileset.update(viewport);
  const [parent, child, root] = tileset.selectedTiles!;
  expect(child).toMatchObject({
    id: 'custom-2',
    zoom: 5,
    bbox,
    crs: 'EPSG:32626',
    tileMatrix: 'custom'
  });
  expect(child.parent).toBe(parent);
  expect(parent.children).toEqual([child]);
  expect(parent.parent).toBeNull();
  expect(root.parent).toBeNull();
  expect(getParentIndex).toHaveBeenCalledWith(rootIndex);
  expect(getTileMetadata).toHaveBeenCalledWith({viewState: viewport, tileSize: 256}, childIndex);

  await vi.waitFor(() => expect(tileset.isLoaded).toBe(true));
  tileset.update(viewport);
  expect(root.isVisible).toBe(true);
});

test('Tileset2D subclass methods take precedence over adapter hooks', () => {
  /** Legacy subclass with its own tile identity and hierarchy. */
  class LegacyTileset extends Tileset2D {
    /** Uses the subclass cache key. */
    override getTileId({x}: TileIndex): string {
      return `legacy-${x}`;
    }

    /** Uses the subclass zoom level. */
    override getTileZoom(): number {
      return 7;
    }

    /** Treats each tile as a root. */
    override getParentIndex(): null {
      return null;
    }
  }

  const tileset = new LegacyTileset({
    adapter: {
      ...projectedAdapter,
      getTileId: () => 'adapter-id',
      getTileZoom: () => 6,
      getParentIndex: () => ({x: 0, y: 0, z: 6})
    },
    getTileData: () => [],
    refinementStrategy: 'never'
  });
  cleanups.push(() => tileset.finalize());
  tileset.update(viewport);

  expect(tileset.selectedTiles).toMatchObject([
    {id: 'legacy-0', zoom: 7, parent: null},
    {id: 'legacy-1', zoom: 7, parent: null}
  ]);
});

test.each([
  {name: 'with outlines', getTileOutline: projectedAdapter.getTileOutline, hasOutline: true},
  {name: 'without outlines', getTileOutline: undefined, hasOutline: false},
  {name: 'with null outlines', getTileOutline: () => null, hasOutline: false}
])('Tileset2D prioritizes projected tiles $name', ({getTileOutline, hasOutline}) => {
  const tileset = new Tileset2D({
    adapter: {...projectedAdapter, getTileOutline},
    getTileData: () => [],
    refinementStrategy: 'never'
  });
  cleanups.push(() => tileset.finalize());
  tileset.update(viewport);

  const [center, far] = tileset.selectedTiles!;
  const centerPriority = tileset['_getRequestPriority'](center);
  const farPriority = tileset['_getRequestPriority'](far);
  if (hasOutline) {
    expect(centerPriority).toBe(0);
    expect(farPriority).toBeGreaterThan(centerPriority);
    expect(farPriority).toBeLessThan(99999999);
  } else {
    expect(centerPriority).toBe(99999999);
    expect(farPriority).toBe(99999999);
  }
});

test('Tileset2D and Tile2DView cull projected tiles using geographic outlines', () => {
  const tileset = new Tileset2D({
    adapter: projectedAdapter,
    getTileData: () => [],
    refinementStrategy: 'never'
  });
  const view = new Tile2DView(tileset);
  cleanups.push(
    () => view.finalize(),
    () => tileset.finalize()
  );
  tileset.update(viewport);
  view.update(viewport);

  const [center, far] = tileset.selectedTiles!;
  const cullRect = {x: 395, y: 295, width: 10, height: 10};
  const modelMatrix = new Matrix4().translate([10, 10, 0]);
  expect(center.boundingBox).toEqual([
    [480000, 4320000],
    [520000, 4280000]
  ]);
  expect(tileset.isTileVisible(center, cullRect, modelMatrix)).toBe(true);
  expect(tileset.isTileVisible(far, cullRect, modelMatrix)).toBe(false);
  expect(view.isTileVisible(center, cullRect, modelMatrix)).toBe(true);
  expect(view.isTileVisible(far, cullRect, modelMatrix)).toBe(false);
});
