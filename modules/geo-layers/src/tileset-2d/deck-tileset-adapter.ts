// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Viewport} from '@deck.gl/core';
import type {Tileset2DAdapter} from './adapter';
import {getTileIndices, tileToBoundingBox} from './utils';

export {getCullBounds, transformBox} from './utils';

/** Standard viewport adapter using the same traversal as the compatibility layers. */
export const tile2DDeckAdapter: Tileset2DAdapter<Viewport> = {
  getTileIndices: ({viewState, modelMatrix, modelMatrixInverse, ...options}) =>
    getTileIndices({
      ...options,
      viewport: viewState,
      zRange: options.zRange || null,
      extent: options.extent || undefined,
      modelMatrix: modelMatrix || undefined,
      modelMatrixInverse: modelMatrixInverse || undefined
    }),
  getTileBoundingBox: ({viewState, tileSize}, {x, y, z}) =>
    tileToBoundingBox(viewState, x, y, z, tileSize)
};
