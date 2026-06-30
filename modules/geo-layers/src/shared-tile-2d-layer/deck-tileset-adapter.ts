// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Viewport} from '@deck.gl/core';

import type {
  SharedTileset2DAdapter,
  SharedTileset2DTileContext,
  SharedTileset2DTraversalContext
} from '../shared-tileset-2d/adapter';
import {getTileIndices, tileToBoundingBox} from '../tileset-2d/utils';

/** deck.gl viewport type used by the shared tile layer adapter. */
export type SharedTile2DDeckViewState = Viewport;

/** Adapts the shared tileset traversal contract to deck.gl viewports. */
export const sharedTile2DDeckAdapter: SharedTileset2DAdapter<Viewport> = {
  getTileIndices: ({
    viewState,
    maxZoom,
    minZoom,
    zRange,
    tileSize,
    extent,
    modelMatrix,
    modelMatrixInverse,
    zoomOffset,
    visibleMinZoom,
    visibleMaxZoom
  }: SharedTileset2DTraversalContext<Viewport>) =>
    getTileIndices({
      viewport: viewState,
      maxZoom,
      minZoom,
      zRange: zRange ?? null,
      tileSize,
      extent: extent || undefined,
      modelMatrix: modelMatrix || undefined,
      modelMatrixInverse: modelMatrixInverse || undefined,
      zoomOffset,
      visibleMinZoom,
      visibleMaxZoom
    }),
  getTileBoundingBox: ({viewState, tileSize}: SharedTileset2DTileContext<Viewport>, {x, y, z}) =>
    tileToBoundingBox(viewState, x, y, z, tileSize)
};
