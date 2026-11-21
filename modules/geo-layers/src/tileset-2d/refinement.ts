// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Tile2DHeader} from './tile-2d-header';

/** Selection and visibility flags for the default consumer or a view-local record. */
export type TileRefinementState = {
  /** Whether traversal selected this tile directly. */
  isSelected: boolean;
  /** Whether refinement includes this tile in the rendered result. */
  isVisible: boolean;
  /** Temporary ancestor/descendant traversal flags. */
  state?: number;
};

/** Resolves mutable flags without coupling refinement to their owner. */
type GetTileState = (tile: Tile2DHeader) => TileRefinementState;

/** Marks a tile as visited while hiding its descendants. */
const VISITED = 1;
/** Marks a loaded tile as contributing visible content. */
const VISIBLE = 2;

/** Applies one shared implementation of built-in refinement to any consumer. */
export function refineTileStates(
  tiles: Tile2DHeader[],
  strategy: 'best-available' | 'no-overlap' | 'never',
  getState: GetTileState
): void {
  if (strategy === 'never') return;
  for (const tile of tiles) getState(tile).state = 0;
  for (const tile of tiles) {
    if (getState(tile).isSelected && !showLoadedAncestor(tile, getState)) {
      if (strategy === 'best-available') showLoadedChildren(tile, getState);
    }
  }
  const ordered = strategy === 'no-overlap' ? [...tiles].sort((a, b) => a.zoom - b.zoom) : tiles;
  for (const tile of ordered) {
    const flags = getState(tile);
    flags.isVisible = Boolean(flags.state! & VISIBLE);
    if (strategy === 'no-overlap') {
      if (flags.isVisible || flags.state! & VISITED) {
        for (const child of tile.children || []) getState(child).state = VISITED;
      } else if (flags.isSelected) {
        showLoadedChildren(tile, getState);
      }
    }
  }
}

/** Selects only the closest loaded tile or ancestor as a fallback. */
function showLoadedAncestor(start: Tile2DHeader, getState: GetTileState): boolean {
  for (let tile: Tile2DHeader | null = start; tile; tile = tile.parent) {
    if (tile.isLoaded || tile.content) {
      getState(tile).state! |= VISIBLE;
      return true;
    }
  }
  return false;
}

/** Selects loaded descendants without hiding usable grandchildren. */
function showLoadedChildren(tile: Tile2DHeader, getState: GetTileState): void {
  for (const child of tile.children || []) {
    if (child.isLoaded || child.content) getState(child).state! |= VISIBLE;
    else showLoadedChildren(child, getState);
  }
}
