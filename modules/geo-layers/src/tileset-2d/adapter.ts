// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Matrix4} from '@math.gl/core/matrix';
import type {Bounds, TileBoundingBox, TileIndex, ZRange} from './types';

/** Traversal inputs required by a {@link Tileset2DAdapter}. */
export type Tileset2DTraversalContext<ViewStateT> = {
  /** Consumer-defined view state used by the adapter. */
  viewState: ViewStateT;
  /** Tile size in pixels. */
  tileSize: number;
  /** Bounding box limiting tile generation. */
  extent?: Bounds | null;
  /** Minimum zoom level to request. */
  minZoom?: number;
  /** Maximum zoom level to request. */
  maxZoom?: number;
  /** Integer zoom offset applied during tile selection. */
  zoomOffset?: number;
  /** Minimum viewport zoom at which tiles are visible. */
  visibleMinZoom?: number | null;
  /** Maximum viewport zoom at which tiles are visible. */
  visibleMaxZoom?: number | null;
  /** Elevation range used during geospatial tile selection. */
  zRange?: ZRange | null;
  /** Optional model matrix applied by the surrounding layer stack. */
  modelMatrix?: Matrix4 | null;
  /** Inverse of the current model matrix. */
  modelMatrixInverse?: Matrix4 | null;
};

/** Minimal tile metadata inputs required by a {@link Tileset2DAdapter}. */
export type Tileset2DTileContext<ViewStateT> = {
  /** Consumer-defined view state used by the adapter. */
  viewState: ViewStateT;
  /** Tile size in pixels. */
  tileSize: number;
};

/** Adapter used by {@link Tileset2D} to compute traversal and tile bounds without depending on a specific viewport implementation. */
export type Tileset2DAdapter<ViewStateT> = {
  /** Returns tile indices that should be selected for one traversal context. */
  getTileIndices: (context: Tileset2DTraversalContext<ViewStateT>) => TileIndex[];
  /** Returns the structured bounding box for one tile index. */
  getTileBoundingBox: (
    context: Tileset2DTileContext<ViewStateT>,
    index: TileIndex
  ) => TileBoundingBox;
  /** Returns the unique cache key for a tile index. */
  getTileId?: (index: TileIndex) => string;
  /** Returns the source zoom level for a tile index. */
  getTileZoom?: (index: TileIndex) => number;
  /** Returns a parent index at a strictly lower source zoom, or null if the tile has no parent. */
  getParentIndex?: (index: TileIndex) => TileIndex | null;
  /** Returns additional tile metadata to merge after the bounding box. */
  getTileMetadata?: (
    context: Tileset2DTileContext<ViewStateT>,
    index: TileIndex
  ) => Record<string, unknown>;
  /**
   * Returns a ring of [longitude, latitude] positions enclosing the tile for culling and request
   * priority, or null if no outline is available.
   * Longitudes may be normalized to [-180, 180] or continuous. deck.gl unwraps the ring across
   * the antimeridian and falls back to bounding-box behavior for rings that encircle a pole.
   */
  getTileOutline?: (
    context: Tileset2DTileContext<ViewStateT>,
    index: TileIndex
  ) => number[][] | null;
};
