// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, expect, test, vi} from 'vitest';
import {OrthographicViewport, WebMercatorViewport} from '@deck.gl/core';
import {Tileset2D} from '@deck.gl/geo-layers';
import type {TileIndex} from '@deck.gl/geo-layers/tileset-2d/types';
import {Tile2DView} from '../../../../modules/geo-layers/src/tileset-2d/tile-2d-view';

/** A tileset whose tile boxes are in projected meters, as a UTM tile matrix gives them. */
class ProjectedTileset extends Tileset2D {
  getTileMetadata(index: TileIndex) {
    const size = 25000;
    return {
      bbox: {
        left: 400000 + index.x * size,
        top: 4250000 - index.y * size,
        right: 400000 + (index.x + 1) * size,
        bottom: 4250000 - (index.y + 1) * size
      }
    };
  }
}

const cullRect = {x: 99, y: 49, width: 3, height: 3};
const cleanups: (() => void)[] = [];
afterEach(() => cleanups.splice(0).forEach(cleanup => cleanup()));

async function getVisibleTiles(tileset: Tileset2D, viewport: any) {
  const view = new Tile2DView(tileset);
  cleanups.push(
    () => view.finalize(),
    () => tileset.finalize()
  );
  tileset.update(viewport);
  view.update(viewport);
  await vi.waitFor(() => expect(view.isLoaded && tileset.isLoaded).toBe(true));
  tileset.update(viewport);
  view.update(viewport);
  const tiles = tileset.tiles.filter(tile => tile.isVisible);
  expect(tiles.length).toBeGreaterThan(0);
  return {view, tiles};
}

test('Tileset2D#isTileVisible keeps projected tile boxes in a geospatial viewport', async () => {
  const viewport = new WebMercatorViewport({
    width: 200,
    height: 100,
    longitude: -27,
    latitude: 38,
    zoom: 5
  });
  const tileset = new ProjectedTileset({getTileData: async () => []});
  const {view, tiles} = await getVisibleTiles(tileset, viewport);
  for (const tile of tiles) {
    // The cull bounds are degrees and the box is meters: they cannot be compared.
    expect(tileset.isTileVisible(tile, cullRect)).toBe(true);
    expect(view.isTileVisible(tile, cullRect)).toBe(true);
  }
});

test('Tileset2D#isTileVisible still culls non-geographic boxes in a non-geospatial viewport', async () => {
  const viewport = new OrthographicViewport({width: 200, height: 100, target: [0, 0, 0], zoom: 0});
  const tileset = new Tileset2D({getTileData: async () => [], tileSize: 64});
  const {view, tiles} = await getVisibleTiles(tileset, viewport);
  const results = tiles.map(tile => tileset.isTileVisible(tile, cullRect));
  expect(results).toContain(true);
  expect(results).toContain(false);
  expect(tiles.map(tile => view.isTileVisible(tile, cullRect))).toEqual(results);
});
