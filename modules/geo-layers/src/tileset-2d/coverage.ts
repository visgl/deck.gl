// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Viewport} from '@deck.gl/core';
import type {TileIndex} from './types';

/** Lowest zoom of the coarse coverage tile on a globe. */
const MIN_GLOBE_COVERAGE_ZOOM = 6;
/** Lowest zoom requested on a globe when selected tiles are at or below the coverage zoom. */
const MIN_GLOBE_FALLBACK_ZOOM = 4;

/** Zoom floors of the coverage ancestors requested for one view. */
export type CoverageFloors = {
  /** Zoom of the coarse ancestor kept under every selected tile. */
  coverageZoom: number;
  /** Zoom of the last-resort ancestor, at most `coverageZoom`; equal to it when unused. */
  fallbackZoom: number;
};

/** Tile pyramid hooks, so that custom indexing schemes resolve their own ancestors. */
type TileHierarchy = {
  getTileId: (index: TileIndex) => string;
  getTileZoom: (index: TileIndex) => number;
  getParentIndex: (index: TileIndex) => TileIndex;
};

/** Returns the coverage floors for a view. Globes skip ancestors that are too coarse to show. */
export function getCoverageFloors(viewport: Viewport, minZoom = 0): CoverageFloors {
  // `viewport.resolution` only sets geometry subdivision, so identify globes by their CRS
  if (viewport.crs?.coordinateFrame === 'geocentric') {
    return {
      coverageZoom: Math.max(minZoom, MIN_GLOBE_COVERAGE_ZOOM),
      fallbackZoom: Math.max(minZoom, MIN_GLOBE_FALLBACK_ZOOM)
    };
  }
  return {coverageZoom: minZoom, fallbackZoom: minZoom};
}

/**
 * Returns the ancestors to prefetch under the selected tiles, keyed by tile id.
 * Rank 0 is the parent, 1 the coverage floor and 2 the fallback floor; lower ranks load first.
 */
export function getCoverageTileIndices(
  selectedIndices: TileIndex[],
  {coverageZoom, fallbackZoom}: CoverageFloors,
  hierarchy: TileHierarchy
): Map<string, {index: TileIndex; rank: number}> {
  const selectedIds = new Set(selectedIndices.map(index => hierarchy.getTileId(index)));
  const result = new Map<string, {index: TileIndex; rank: number}>();

  for (const selectedIndex of selectedIndices) {
    const zoom = hierarchy.getTileZoom(selectedIndex);
    const zooms = [Math.max(coverageZoom, zoom - 1), coverageZoom, fallbackZoom];
    let index = selectedIndex;
    for (let rank = 0; rank < zooms.length; rank++) {
      if (zooms[rank] < zoom) {
        while (hierarchy.getTileZoom(index) > zooms[rank]) {
          index = hierarchy.getParentIndex(index);
        }
        const id = hierarchy.getTileId(index);
        const existing = result.get(id);
        if (!selectedIds.has(id) && (!existing || rank < existing.rank)) {
          result.set(id, {index, rank});
        }
      }
    }
  }
  return result;
}
