// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {it, vi, expect} from 'vitest';
import {WebMercatorViewport} from '@deck.gl/core';
import {Tileset2D} from '@deck.gl/geo-layers';
import {Tile2DView} from '../../../modules/geo-layers/src/tileset-2d/tile-2d-view';

// Recorded by running the unmodified Tileset2D from master c00485314b.
// These expectations do not compare two paths through the new refinement code.
const ZOOM_3 = ['3-3-3', '3-4-3', '4-3-3', '4-4-3'];
const ZOOM_4 = ['7-7-4', '7-8-4', '8-7-4', '8-8-4'];
const ZOOM_5 = ['15-15-5', '15-16-5', '16-15-5', '16-16-5'];
const PLACEHOLDERS = [[], ZOOM_4, ZOOM_4, ZOOM_5, ZOOM_4, ZOOM_3, ZOOM_4];
const EXPECTED = {
  'best-available': PLACEHOLDERS,
  'no-overlap': PLACEHOLDERS,
  never: [ZOOM_4, ZOOM_4, ZOOM_5, ZOOM_5, ZOOM_3, ZOOM_3, ZOOM_4]
};

it.each(['default', 'independent'] as const)(
  'matches pre-PR master snapshots through the %s consumer',
  async consumer => {
    for (const refinementStrategy of Object.keys(EXPECTED) as (keyof typeof EXPECTED)[]) {
      const allowed = new Set<number>();
      const pending: {zoom: number; resolve: () => void}[] = [];
      const tileset = new Tileset2D({
        refinementStrategy,
        getTileData: ({index}) =>
          allowed.has(index.z)
            ? []
            : new Promise<any[]>(resolve => {
                pending.push({zoom: index.z, resolve: () => resolve([])});
              })
      });
      const view = consumer === 'independent' ? new Tile2DView(tileset) : null;
      const states: string[][] = [];
      const update = (zoom: number) => {
        const viewport = new WebMercatorViewport({
          width: 256,
          height: 256,
          longitude: 0,
          latitude: 0,
          zoom
        });
        (view || tileset).update(viewport);
        states.push(
          tileset.tiles
            .filter(tile => (view || tileset).isTileVisible(tile))
            .map(tile => tile.id)
            .sort()
        );
      };
      const settle = async (zoom: number) => {
        await vi.waitFor(() => expect(pending.some(p => p.zoom === zoom)).toBe(true));
        allowed.add(zoom);
        pending.splice(0).forEach(request => request.resolve());
        await vi.waitFor(() => expect((view || tileset).isLoaded).toBe(true));
        update(zoom);
      };
      try {
        update(4);
        await settle(4);
        update(5);
        await settle(5);
        update(3);
        await settle(3);
        update(4);
        expect(states, refinementStrategy).toEqual(EXPECTED[refinementStrategy]);
      } finally {
        view?.finalize();
        tileset.finalize();
      }
    }
  }
);
