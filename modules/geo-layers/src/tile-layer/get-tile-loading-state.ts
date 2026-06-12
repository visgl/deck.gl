// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {TileLayer} from './tile-layer';
import type {Tile2DHeader} from '../tileset-2d/tile-2d-header';

export type TileLoadingState = {
  /** Total number of tiles in the current viewport */
  total: number;
  /** Number of tiles that have loaded successfully (with content) */
  loaded: number;
  /** Number of tiles that failed to load (isLoaded but content is null) */
  failed: number;
  /** Number of tiles still loading */
  pending: number;
  /** Percentage of tiles loaded (loaded / total) */
  percentLoaded: number;
  /** True if all tiles are done loading (loaded or failed) */
  isComplete: boolean;
  /** True if all tiles loaded successfully (no failures) */
  isSuccess: boolean;
};

/**
 * Get detailed loading state for tiles in a TileLayer's viewport.
 *
 * Unlike `layer.isLoaded` which only returns a boolean, this function provides
 * granular information about tile loading progress, including:
 * - How many tiles loaded successfully vs failed
 * - Loading percentage for progress UI
 * - Whether any tiles are still pending
 *
 * @param layer - A TileLayer instance
 * @returns Detailed tile loading state
 *
 * @example
 * ```typescript
 * const state = getTileLoadingState(tileLayer);
 * console.log(`${state.loaded}/${state.total} tiles loaded`);
 * console.log(`${state.failed} tiles failed`);
 * console.log(`${state.percentLoaded}% complete`);
 *
 * if (state.isComplete && !state.isSuccess) {
 *   console.warn('Some tiles failed to load');
 * }
 * ```
 *
 * @note
 * deck.gl's `layer.isLoaded` returns `true` once all tile requests are "settled"
 * (completed or failed). This is intentional to prevent waiting forever for tiles
 * that will never load (404s, network errors, etc.). Use this function to distinguish
 * between successfully loaded tiles and failed tiles.
 */
export function getTileLoadingState<T>(layer: TileLayer<T>): TileLoadingState {
  const tileset = layer.state?.tileset;
  const selectedTiles: Tile2DHeader<T>[] = tileset?.selectedTiles || [];

  if (selectedTiles.length === 0) {
    return {
      total: 0,
      loaded: 0,
      failed: 0,
      pending: 0,
      percentLoaded: 100,
      isComplete: true,
      isSuccess: true
    };
  }

  let loaded = 0;
  let failed = 0;
  let pending = 0;

  for (const tile of selectedTiles) {
    if (!tile.isLoaded) {
      pending++;
    } else if (tile.content === null) {
      // Tile request completed but returned no content (404, error, etc.)
      failed++;
    } else {
      // Tile loaded successfully with content
      loaded++;
    }
  }

  const total = selectedTiles.length;
  const percentLoaded = total > 0 ? Math.round((loaded / total) * 100) : 100;
  const isComplete = pending === 0;
  const isSuccess = isComplete && failed === 0;

  return {
    total,
    loaded,
    failed,
    pending,
    percentLoaded,
    isComplete,
    isSuccess
  };
}
