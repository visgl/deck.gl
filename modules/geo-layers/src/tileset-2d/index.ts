// deck.gl, MIT license

export type {TileLoadProps} from './tile-2d-header';

export type {Tileset2DProps, RefinementStrategy, RefinementStrategyFunction} from './tileset-2d';
export {Tileset2D} from './tileset-2d';
export {Tile2DHeader} from './tile-2d-header';

export type {TraversalParameters} from './tile-2d-traversal';

export type {
  ZRange,
  Bounds,
  GeoBoundingBox,
  NonGeoBoundingBox,
  TileBoundingBox
} from './bounding-box-utils';

export {isGeoBoundingBox} from './bounding-box-utils';

export {
  tileIndexToBoundingBox,
  /** @deprecated */
  tileIndexToBoundingBox as tileToBoundingBox
} from './tile-index-utils';

export {getTileIndices} from './get-tile-indices';

export {isURLTemplate, getURLFromTemplate} from './url-utils';
