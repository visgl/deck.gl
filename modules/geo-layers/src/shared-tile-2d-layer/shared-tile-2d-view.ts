// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Viewport} from '@deck.gl/core';
import {Matrix4, equals, type NumericArray} from '@math.gl/core';

import {
  STRATEGY_DEFAULT,
  STRATEGY_NEVER,
  STRATEGY_REPLACE,
  SharedTile2DHeader,
  type SharedTileset2D
} from '../shared-tileset-2d/index';
import {memoize} from '../tileset-2d/memoize';
import type {ZRange} from '../tileset-2d/types';
import {getCullBounds, transformBox} from '../tileset-2d/utils';
import {sharedTile2DDeckAdapter} from './deck-tileset-adapter';

const TILE_STATE_VISITED = 1;
const TILE_STATE_VISIBLE = 2;

const STRATEGIES = {
  [STRATEGY_DEFAULT]: updateTileStateDefault,
  [STRATEGY_REPLACE]: updateTileStateReplace,
  [STRATEGY_NEVER]: () => {}
};

type TileViewState = {
  isSelected: boolean;
  isVisible: boolean;
  state: number;
};

/** Per-viewport traversal state for the deck-facing shared tile layer. */
export class SharedTile2DView<DataT = any> {
  /** Unique consumer identifier used by the shared tileset cache. */
  readonly id = Symbol('tile-2d-view');

  private _tileset: SharedTileset2D<DataT, Viewport>;
  private _selectedTiles: SharedTile2DHeader<DataT>[] | null = null;
  private _frameNumber = 0;
  private _viewport: Viewport | null = null;
  private _zRange: ZRange | null = null;
  private _modelMatrix = new Matrix4();
  private _modelMatrixInverse = new Matrix4();
  private _state = new Map<SharedTile2DHeader<DataT>, TileViewState>();

  /** Creates a viewport-specific view of a shared tileset. */
  constructor(tileset: SharedTileset2D<DataT, Viewport>) {
    this._tileset = tileset;
    if (!this._tileset.adapter) {
      this._tileset.setOptions({adapter: sharedTile2DDeckAdapter});
    }
    this._tileset.attachConsumer(this.id);
  }

  /** Releases this view and detaches it from the shared tileset. */
  finalize(): void {
    this._tileset.detachConsumer(this.id);
    this._selectedTiles = null;
    this._state.clear();
  }

  /** Tiles selected for the last viewport update. */
  get selectedTiles(): SharedTile2DHeader<DataT>[] | null {
    return this._selectedTiles;
  }

  /** Indicates whether all selected tiles are fully loaded for this view. */
  get isLoaded(): boolean {
    return this._selectedTiles !== null && this._selectedTiles.every(tile => tile.isLoaded);
  }

  /** Indicates whether any selected tile needs to be re-requested. */
  get needsReload(): boolean {
    return this._selectedTiles !== null && this._selectedTiles.some(tile => tile.needsReload);
  }

  /** Updates tile selection and visibility for a viewport and returns the current frame number. */
  update(
    viewport: Viewport,
    {
      zRange,
      modelMatrix
    }: {
      zRange: ZRange | null;
      modelMatrix: NumericArray | null;
    } = {zRange: null, modelMatrix: null}
  ): number {
    const modelMatrixAsMatrix4 = modelMatrix ? new Matrix4(modelMatrix) : new Matrix4();
    const isModelMatrixNew = !modelMatrixAsMatrix4.equals(this._modelMatrix);

    if (
      !this._viewport ||
      !viewport.equals(this._viewport) ||
      !equals(this._zRange, zRange) ||
      isModelMatrixNew
    ) {
      if (isModelMatrixNew) {
        this._modelMatrixInverse = modelMatrixAsMatrix4.clone().invert();
        this._modelMatrix = modelMatrixAsMatrix4;
      }
      this._viewport = viewport;
      this._zRange = zRange;
      const tileIndices = this._tileset.getTileIndices({
        viewState: viewport,
        maxZoom: this._tileset.maxZoom,
        minZoom: this._tileset.minZoom,
        zRange,
        modelMatrix: this._modelMatrix,
        modelMatrixInverse: this._modelMatrixInverse
      });
      this._selectedTiles = tileIndices.map(index => this._tileset.getTile(index, true));
      this._tileset.prepareTiles();
    } else if (this.needsReload) {
      this._selectedTiles = (this._selectedTiles || []).map(tile =>
        this._tileset.getTile(tile.index, true)
      );
      this._tileset.prepareTiles();
    }

    const changed = this._updateTileStates();
    this._tileset.updateConsumer(this.id, this._selectedTiles || [], this._getVisibleTiles());

    if (changed) {
      this._frameNumber++;
    }
    return this._frameNumber;
  }

  /** Tests whether a tile should render in the current viewport and culling rectangle. */
  isTileVisible(
    tile: SharedTile2DHeader<DataT>,
    cullRect?: {x: number; y: number; width: number; height: number},
    modelMatrix?: Matrix4 | null
  ): boolean {
    const state = this._state.get(tile);
    if (!state?.isVisible) {
      return false;
    }

    if (!cullRect || !this._viewport) {
      return true;
    }
    const boundsArr = this._getCullBounds({
      viewport: this._viewport,
      z: this._zRange,
      cullRect
    });
    return boundsArr.some(bounds => this._tileOverlapsBounds(tile, bounds, modelMatrix));
  }

  private _getVisibleTiles(): SharedTile2DHeader<DataT>[] {
    const result: SharedTile2DHeader<DataT>[] = [];
    for (const tile of this._tileset.tiles) {
      if (this._state.get(tile)?.isVisible) {
        result.push(tile);
      }
    }
    return result;
  }

  private _getCullBounds = memoize(getCullBounds);

  private _updateTileStates(): boolean {
    const refinementStrategy = this._tileset.refinementStrategy || STRATEGY_DEFAULT;
    const allTiles = this._tileset.tiles;
    const previousVisibility = new Map<SharedTile2DHeader<DataT>, boolean>();

    for (const tile of allTiles) {
      const existing = this._state.get(tile);
      previousVisibility.set(tile, existing?.isVisible || false);
      this._state.set(tile, {isSelected: false, isVisible: false, state: 0});
    }

    for (const tile of this._selectedTiles || []) {
      const state = this._state.get(tile) || {isSelected: false, isVisible: false, state: 0};
      state.isSelected = true;
      state.isVisible = true;
      this._state.set(tile, state);
    }

    STRATEGIES[refinementStrategy](allTiles, this._state);

    let changed = false;
    for (const tile of allTiles) {
      const state = this._state.get(tile);
      if (state && state.isVisible !== previousVisibility.get(tile)) {
        changed = true;
      }
    }
    return changed;
  }

  private _tileOverlapsBounds(
    tile: SharedTile2DHeader<DataT>,
    [minX, minY, maxX, maxY]: [number, number, number, number],
    modelMatrix?: Matrix4 | null
  ): boolean {
    const bbox = this._getTileBoundingBox(tile, modelMatrix);
    if ('west' in bbox) {
      return bbox.west < maxX && bbox.east > minX && bbox.south < maxY && bbox.north > minY;
    }
    const y0 = Math.min(bbox.top, bbox.bottom);
    const y1 = Math.max(bbox.top, bbox.bottom);
    return bbox.left < maxX && bbox.right > minX && y0 < maxY && y1 > minY;
  }

  private _getTileBoundingBox(tile: SharedTile2DHeader<DataT>, modelMatrix?: Matrix4 | null) {
    const {bbox} = tile;
    if ('west' in bbox || !modelMatrix || Matrix4.IDENTITY.equals(modelMatrix)) {
      return bbox;
    }
    const [left, top, right, bottom] = transformBox(
      [bbox.left, bbox.top, bbox.right, bbox.bottom],
      modelMatrix
    );
    return {left, top, right, bottom};
  }
}

function updateTileStateDefault(
  allTiles: SharedTile2DHeader[],
  stateMap: Map<SharedTile2DHeader, TileViewState>
) {
  for (const tile of allTiles) {
    getTileState(stateMap, tile).state = 0;
  }
  for (const tile of allTiles) {
    if (getTileState(stateMap, tile).isSelected && !getPlaceholderInAncestors(tile, stateMap)) {
      getPlaceholderInChildren(tile, stateMap);
    }
  }
  for (const tile of allTiles) {
    const state = getTileState(stateMap, tile);
    state.isVisible = Boolean(state.state & TILE_STATE_VISIBLE);
  }
}

function updateTileStateReplace(
  allTiles: SharedTile2DHeader[],
  stateMap: Map<SharedTile2DHeader, TileViewState>
) {
  for (const tile of allTiles) {
    getTileState(stateMap, tile).state = 0;
  }
  for (const tile of allTiles) {
    if (getTileState(stateMap, tile).isSelected) {
      getPlaceholderInAncestors(tile, stateMap);
    }
  }
  const sortedTiles = Array.from(allTiles).sort((t1, t2) => t1.zoom - t2.zoom);
  for (const tile of sortedTiles) {
    const tileState = getTileState(stateMap, tile);
    tileState.isVisible = Boolean(tileState.state & TILE_STATE_VISIBLE);

    if (tile.children && (tileState.isVisible || tileState.state & TILE_STATE_VISITED)) {
      for (const child of tile.children) {
        getTileState(stateMap, child).state = TILE_STATE_VISITED;
      }
    } else if (tileState.isSelected) {
      getPlaceholderInChildren(tile, stateMap);
    }
  }
}

function getPlaceholderInAncestors(
  startTile: SharedTile2DHeader,
  stateMap: Map<SharedTile2DHeader, TileViewState>
): boolean {
  let tile: SharedTile2DHeader | null = startTile.parent;
  while (tile) {
    const state = getTileState(stateMap, tile);
    state.state |= TILE_STATE_VISIBLE | TILE_STATE_VISITED;
    if (tile.isLoaded || tile.content) {
      return true;
    }
    tile = tile.parent;
  }
  return false;
}

function getPlaceholderInChildren(
  tile: SharedTile2DHeader,
  stateMap: Map<SharedTile2DHeader, TileViewState>
): void {
  const state = getTileState(stateMap, tile);
  state.state |= TILE_STATE_VISIBLE | TILE_STATE_VISITED;

  if (!tile.children || !tile.children.length || tile.isLoaded || tile.content) {
    return;
  }

  for (const child of tile.children) {
    const childState = getTileState(stateMap, child);
    if (!(childState.state & TILE_STATE_VISITED)) {
      getPlaceholderInChildren(child, stateMap);
    }
  }
}

function getTileState(
  stateMap: Map<SharedTile2DHeader, TileViewState>,
  tile: SharedTile2DHeader
): TileViewState {
  let tileState = stateMap.get(tile);
  if (!tileState) {
    tileState = {isSelected: false, isVisible: false, state: 0};
    stateMap.set(tile, tileState);
  }
  return tileState;
}
