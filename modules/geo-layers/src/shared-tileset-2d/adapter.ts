// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Matrix4} from '@math.gl/core';
import type {Bounds, TileBoundingBox, TileIndex, ZRange} from './types';

/** Traversal inputs required by a {@link SharedTileset2DAdapter}. */
export type SharedTileset2DTraversalContext<ViewStateT> = {
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

/** Minimal tile metadata inputs required by a {@link SharedTileset2DAdapter}. */
export type SharedTileset2DTileContext<ViewStateT> = {
  /** Consumer-defined view state used by the adapter. */
  viewState: ViewStateT;
  /** Tile size in pixels. */
  tileSize: number;
};

/** Adapter used by {@link SharedTileset2D} to compute traversal and tile bounds without depending on a specific viewport implementation. */
export type SharedTileset2DAdapter<ViewStateT> = {
  /** Returns tile indices that should be selected for one traversal context. */
  getTileIndices: (context: SharedTileset2DTraversalContext<ViewStateT>) => TileIndex[];
  /** Returns the structured bounding box for one tile index. */
  getTileBoundingBox: (
    context: SharedTileset2DTileContext<ViewStateT>,
    index: TileIndex
  ) => TileBoundingBox;
};
