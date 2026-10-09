// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// deck.gl, MIT license

export type {
  TileLoadProps,
  Bounds,
  ZRange,
  GeoBoundingBox,
  NonGeoBoundingBox,
  TileBoundingBox
} from './types';

export type {Tileset2DProps, RefinementStrategy, LODStrategy} from './tileset-2d';
export {Tileset2D, STRATEGY_DEFAULT, LOD_STRATEGY_COVERAGE, LOD_STRATEGY_NONE} from './tileset-2d';

export {Tile2DHeader} from './tile-2d-header';

export type {URLTemplate} from './utils';
export {
  isGeoBoundingBox,
  isURLTemplate,
  urlType,
  getURLFromTemplate,
  getTileIndices,
  tileToBoundingBox
} from './utils';
