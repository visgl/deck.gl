import Tile2DHeader from './tile-2d-header';
import {Matrix4} from '@math.gl/core';
import {Viewport} from '@deck.gl/core';
import {TileIndex, ZRange} from './types';
import {TileLayerProps} from './tile-layer';
export declare const STRATEGY_NEVER = 'never';
export declare const STRATEGY_REPLACE = 'no-overlap';
export declare const STRATEGY_DEFAULT = 'best-available';
export declare type RefinementStrategyFunction = (tiles: Tile2DHeader[]) => void;
export declare type RefinementStrategy =
  | typeof STRATEGY_NEVER
  | typeof STRATEGY_REPLACE
  | typeof STRATEGY_DEFAULT
  | RefinementStrategyFunction;
export declare type Tileset2DProps = Pick<
  Required<TileLayerProps>,
  | 'tileSize'
  | 'maxCacheSize'
  | 'maxCacheByteSize'
  | 'refinementStrategy'
  | 'extent'
  | 'maxZoom'
  | 'minZoom'
  | 'maxRequests'
  | 'zoomOffset'
> & {
  getTileData: NonNullable<TileLayerProps['getTileData']>;
  onTileLoad: (tile: Tile2DHeader) => void;
  onTileUnload: (tile: Tile2DHeader) => void;
  onTileError: (error: any, tile: Tile2DHeader) => void;
};
/**
 * Manages loading and purging of tile data. This class caches recently visited tiles
 * and only creates new tiles if they are present.
 */
export default class Tileset2D {
  private opts;
  private _requestScheduler;
  private _cache;
  private _dirty;
  private _tiles;
  private _cacheByteSize;
  private _viewport;
  private _zRange?;
  private _selectedTiles;
  private _frameNumber;
  private _modelMatrix;
  private _modelMatrixInverse;
  private _maxZoom?;
  private _minZoom?;
  private onTileLoad;
  /**
   * Takes in a function that returns tile data, a cache size, and a max and a min zoom level.
   * Cache size defaults to 5 * number of tiles in the current viewport
   */
  constructor(opts: Tileset2DProps);
  get tiles(): Tile2DHeader<any>[];
  get selectedTiles(): Tile2DHeader[] | null;
  get isLoaded(): boolean;
  get needsReload(): boolean;
  setOptions(opts: Tileset2DProps): void;
  finalize(): void;
  reloadAll(): void;
  /**
   * Update the cache with the given viewport and model matrix and triggers callback onUpdate.
   */
  update(
    viewport: Viewport,
    {
      zRange,
      modelMatrix
    }?: {
      zRange?: ZRange;
      modelMatrix?: Matrix4;
    }
  ): number;
  isTileVisible(
    tile: Tile2DHeader,
    cullRect?: {
      x: number;
      y: number;
      width: number;
      height: number;
    }
  ): boolean;
  /** Returns array of tile indices in the current viewport */
  getTileIndices({
    viewport,
    maxZoom,
    minZoom,
    zRange,
    modelMatrix,
    modelMatrixInverse
  }: {
    viewport: Viewport;
    maxZoom?: number;
    minZoom?: number;
    zRange: ZRange | undefined;
    tileSize?: number;
    modelMatrix?: Matrix4;
    modelMatrixInverse?: Matrix4;
    zoomOffset?: number;
  }): TileIndex[];
  /** Returns unique string key for a tile index */
  getTileId(index: TileIndex): string;
  /** Returns a zoom level for a tile index */
  getTileZoom(index: TileIndex): number;
  /** Returns additional metadata to add to tile, bbox by default */
  getTileMetadata(index: TileIndex): Record<string, any>;
  /** Returns index of the parent tile */
  getParentIndex(index: TileIndex): {
    x: number;
    y: number;
    z: number;
  };
  private updateTileStates;
  private _getCullBounds;
  private _pruneRequests;
  private _rebuildTree;
  /**
   * Clear tiles that are not visible when the cache is full
   */
  private _resizeCache;
  private _getTile;
  _getNearestAncestor(tile: Tile2DHeader): Tile2DHeader | null;
}
// # sourceMappingURL=tileset-2d.d.ts.map
