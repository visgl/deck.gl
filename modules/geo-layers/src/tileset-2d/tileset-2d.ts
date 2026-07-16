// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Viewport} from '@deck.gl/core';

import {RequestScheduler} from '@loaders.gl/loader-utils';
import {Matrix4, equals, NumericArray} from '@math.gl/core';

import {Tile2DHeader} from './tile-2d-header';

import {getTileIndices, tileToBoundingBox, getCullBounds, transformBox} from './utils';
import {Bounds, TileBoundingBox, TileIndex, ZRange} from './types';
import {TileLoadProps} from './types';
import {memoize} from './memoize';

// bit masks
const TILE_STATE_VISITED = 1;
const TILE_STATE_VISIBLE = 2;
/*
   show cached parent tile if children are loading
   +-----------+       +-----+            +-----+-----+
   |           |       |     |            |     |     |
   |           |       |     |            |     |     |
   |           |  -->  +-----+-----+  ->  +-----+-----+
   |           |             |     |      |     |     |
   |           |             |     |      |     |     |
   +-----------+             +-----+      +-----+-----+

   show cached children tiles when parent is loading
   +-------+----       +------------
   |       |           |
   |       |           |
   |       |           |
   +-------+----  -->  |
   |       |           |
 */

export const STRATEGY_NEVER = 'never';
export const STRATEGY_REPLACE = 'no-overlap';
export const STRATEGY_DEFAULT = 'best-available';
export const LOD_STRATEGY_NONE = 'none';
export const LOD_STRATEGY_COVERAGE = 'coverage';

export type RefinementStrategyFunction = (tiles: Tile2DHeader[]) => void;
export type RefinementStrategy =
  | 'never'
  | 'no-overlap'
  | 'best-available'
  | RefinementStrategyFunction;
export type LODStrategy = 'none' | 'coverage';

const DEFAULT_CACHE_SCALE = 5;
<<<<<<< HEAD
const COVERAGE_ZOOM_DELTA = 1;
const MIN_RESOLUTION_COVERAGE_ZOOM = 6;
const MIN_RESOLUTION_FALLBACK_ZOOM = 4;
const SELECTED_TILE_PRIORITY = 0;
const VISIBLE_TILE_PRIORITY = 1e8;
const PREFETCH_TILE_PRIORITY = 2e8;
=======
const SELECTED_TILE_PRIORITY = 0;
const VISIBLE_TILE_PRIORITY = 1e8;
const MAX_TILE_DISTANCE_PRIORITY = VISIBLE_TILE_PRIORITY - SELECTED_TILE_PRIORITY - 1;
>>>>>>> origin/master

const STRATEGIES = {
  [STRATEGY_DEFAULT]: updateTileStateDefault,
  [STRATEGY_REPLACE]: updateTileStateReplace,
  [STRATEGY_NEVER]: () => {}
};

export type Tileset2DProps<DataT = any> = {
  /** `getTileData` is called to retrieve the data of each tile. */
  getTileData: (props: TileLoadProps) => Promise<DataT> | DataT;

  /** The bounding box of the layer's data. */
  extent?: number[] | null;
  /** The pixel dimension of the tiles, usually a power of 2. */
  tileSize?: number;
  /** The max zoom level of the layer's data. @default null */
  maxZoom?: number | null;
  /** The min zoom level of the layer's data. @default 0 */
  minZoom?: number | null;
  /** The maximum number of tiles that can be cached. */
  maxCacheSize?: number | null;
  /** The maximum memory used for caching tiles. @default null */
  maxCacheByteSize?: number | null;
  /** How the tile layer refines the visibility of tiles. @default 'best-available' */
  refinementStrategy?: RefinementStrategy;
  /** How the tile layer prefetches lower resolution coverage. @default 'none' */
  lodStrategy?: LODStrategy;
  /** Range of minimum and maximum heights in the tile. */
  zRange?: ZRange | null;
  /** The maximum number of concurrent getTileData calls. @default 6 */
  maxRequests?: number;
  /** Queue tile requests until no new tiles have been requested for at least `debounceTime` milliseconds. @default 0 */
  debounceTime?: number;
  /** Changes the zoom level at which the tiles are fetched. Needs to be an integer. @default 0 */
  zoomOffset?: number;
  /** The minimum zoom level at which tiles are visible. @default null */
  visibleMinZoom?: number | null;
  /** The maximum zoom level at which tiles are visible. @default null */
  visibleMaxZoom?: number | null;
  /** Called when a tile successfully loads. */
  onTileLoad?: (tile: Tile2DHeader<DataT>) => void;
  /** Called when a tile is cleared from cache. */
  onTileUnload?: (tile: Tile2DHeader<DataT>) => void;
  /** Called when a tile failed to load. */
  onTileError?: (err: any, tile: Tile2DHeader<DataT>) => void;

  // onTileLoad: (tile: Tile2DHeader) => void;
  // onTileUnload: (tile: Tile2DHeader) => void;
  // onTileError: (error: any, tile: Tile2DHeader) => void;
  /** Called when all tiles in the current viewport are loaded. */
  // sonViewportLoad?: ((tiles: Tile2DHeader<DataT>[]) => void) | null;
};

export const DEFAULT_TILESET2D_PROPS: Omit<Required<Tileset2DProps>, 'getTileData'> = {
  extent: null,
  tileSize: 512,

  maxZoom: null,
  minZoom: null,
  maxCacheSize: null,
  maxCacheByteSize: null,
  refinementStrategy: 'best-available',
  lodStrategy: 'none',
  zRange: null,
  maxRequests: 6,
  debounceTime: 0,
  zoomOffset: 0,
  visibleMinZoom: null,
  visibleMaxZoom: null,

  // onTileLoad: (tile: Tile2DHeader) => void,  // onTileUnload: (tile: Tile2DHeader) => void,  // onTileError: (error: any, tile: Tile2DHeader) => void,  /** Called when all tiles in the current viewport are loaded. */
  // onViewportLoad: ((tiles: Tile2DHeader<DataT>[]) => void) | null,
  onTileLoad: () => {},
  onTileUnload: () => {},
  onTileError: () => {}
};

/**
 * Manages loading and purging of tile data. This class caches recently visited tiles
 * and only creates new tiles if they are present.
 */
export class Tileset2D {
  protected opts: Required<Tileset2DProps>;
  private _requestScheduler: RequestScheduler;
  private _cache: Map<string, Tile2DHeader>;
  private _dirty: boolean;
  private _tiles: Tile2DHeader[];

  private _cacheByteSize: number;
  private _viewport: Viewport | null;
  private _zRange: ZRange | null;
  private _selectedTiles: Tile2DHeader[] | null;
  private _prefetchTiles: Tile2DHeader[];
  private _prefetchTilePriority: Map<string, number>;
  private _frameNumber: number;
  private _modelMatrix: Matrix4;
  private _modelMatrixInverse: Matrix4;

  private _maxZoom?: number;
  private _minZoom?: number;

  private onTileLoad: (tile: Tile2DHeader) => void;

  /**
   * Takes in a function that returns tile data, a cache size, and a max and a min zoom level.
   * Cache size defaults to 5 * number of tiles in the current viewport
   */
  constructor(opts: Tileset2DProps) {
    this.opts = {...DEFAULT_TILESET2D_PROPS, ...opts};
    this.setOptions(this.opts);

    this.onTileLoad = tile => {
      this.opts.onTileLoad?.(tile);
      if (this.opts.maxCacheByteSize !== null) {
        this._cacheByteSize += tile.byteLength;
        this._resizeCache();
      }
    };

    this._requestScheduler = new RequestScheduler({
      throttleRequests: this.opts.maxRequests > 0 || this.opts.debounceTime > 0,
      maxRequests: this.opts.maxRequests,
      debounceTime: this.opts.debounceTime
    });

    // Maps tile id in string {z}-{x}-{y} to a Tile object
    this._cache = new Map();
    this._tiles = [];
    this._dirty = false;
    this._cacheByteSize = 0;

    // Cache the last processed viewport
    this._viewport = null;
    this._zRange = null;
    this._selectedTiles = null;
    this._prefetchTiles = [];
    this._prefetchTilePriority = new Map();
    this._frameNumber = 0;

    this._modelMatrix = new Matrix4();
    this._modelMatrixInverse = new Matrix4();
  }

  /* Public API */
  get tiles() {
    return this._tiles;
  }

  get selectedTiles(): Tile2DHeader[] | null {
    return this._selectedTiles;
  }

  get isLoaded(): boolean {
    return this._selectedTiles !== null && this._selectedTiles.every(tile => tile.isLoaded);
  }

  get needsReload(): boolean {
    return this._selectedTiles !== null && this._selectedTiles.some(tile => tile.needsReload);
  }

  setOptions(opts: Tileset2DProps): void {
    Object.assign(this.opts, opts);
    if (Number.isFinite(opts.maxZoom)) {
      this._maxZoom = Math.floor(opts.maxZoom as number);
    }
    if (Number.isFinite(opts.minZoom)) {
      this._minZoom = Math.ceil(opts.minZoom as number);
    }
    // Force re-evaluation of tile indices on next update
    this._viewport = null;
  }

  // Clean up any outstanding tile requests.
  finalize(): void {
    for (const tile of this._cache.values()) {
      if (tile.isLoading) {
        tile.abort();
      }
    }
    this._cache.clear();
    this._tiles = [];
    this._selectedTiles = null;
  }

  reloadAll(): void {
    for (const id of this._cache.keys()) {
      const tile = this._cache.get(id) as Tile2DHeader;
      if (!this._selectedTiles || !this._selectedTiles.includes(tile)) {
        this._cache.delete(id);
      } else {
        tile.setNeedsReload();
      }
    }
  }

  /**
   * Update the cache with the given viewport and model matrix and triggers callback onUpdate.
   */
  update(
    viewport: Viewport,
    {zRange, modelMatrix}: {zRange: ZRange | null; modelMatrix: NumericArray | null} = {
      zRange: null,
      modelMatrix: null
    }
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
      const tileIndices = this.getTileIndices({
        viewport,
        maxZoom: this._maxZoom,
        minZoom: this._minZoom,
        zRange,
        modelMatrix: this._modelMatrix,
        modelMatrixInverse: this._modelMatrixInverse
      });
      this._selectedTiles = tileIndices.map(index => this._getTile(index, true));
      this._updatePrefetchTiles();

      if (this._dirty) {
        // Some new tiles are added
        this._rebuildTree();
      }
      // Check for needed reloads explicitly even if the view/matrix has not changed.
    } else if (this.needsReload) {
      this._selectedTiles = this._selectedTiles!.map(tile => this._getTile(tile.index, true));
      this._updatePrefetchTiles();
    }

    // Update tile states
    const changed = this.updateTileStates();
    this._pruneRequests();

    if (this._dirty) {
      // cache size is either the user defined maxSize or 5 * number of current tiles in the viewport.
      this._resizeCache();
    }

    if (changed) {
      this._frameNumber++;
    }

    return this._frameNumber;
  }

  // eslint-disable-next-line complexity
  isTileVisible(
    tile: Tile2DHeader,
    cullRect?: {x: number; y: number; width: number; height: number},
    modelMatrix?: Matrix4 | null
  ): boolean {
    if (!tile.isVisible) {
      return false;
    }

    if (cullRect && this._viewport) {
      const boundsArr = this._getCullBounds({
        viewport: this._viewport,
        z: this._zRange,
        cullRect
      });
      let {bbox} = tile;
      for (const [minX, minY, maxX, maxY] of boundsArr) {
        let overlaps;
        if ('west' in bbox) {
          overlaps = bbox.west < maxX && bbox.east > minX && bbox.south < maxY && bbox.north > minY;
        } else {
          if (modelMatrix && !Matrix4.IDENTITY.equals(modelMatrix)) {
            const [left, top, right, bottom] = transformBox(
              [bbox.left, bbox.top, bbox.right, bbox.bottom],
              modelMatrix
            );
            bbox = {left, top, right, bottom};
          }
          // top/bottom could be swapped depending on the indexing system
          const y0 = Math.min(bbox.top, bbox.bottom);
          const y1 = Math.max(bbox.top, bbox.bottom);
          overlaps = bbox.left < maxX && bbox.right > minX && y0 < maxY && y1 > minY;
        }
        if (overlaps) {
          return true;
        }
      }
      return false;
    }
    return true;
  }

  /* Public interface for subclassing */

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
    zRange: ZRange | null;
    tileSize?: number;
    modelMatrix?: Matrix4;
    modelMatrixInverse?: Matrix4;
    zoomOffset?: number;
  }): TileIndex[] {
    const {tileSize, extent, zoomOffset, visibleMinZoom, visibleMaxZoom} = this.opts;
    return getTileIndices({
      viewport,
      maxZoom,
      minZoom,
      zRange,
      tileSize,
      extent: extent as Bounds | undefined,
      modelMatrix,
      modelMatrixInverse,
      zoomOffset,
      visibleMinZoom,
      visibleMaxZoom
    });
  }

  /** Returns unique string key for a tile index */
  getTileId(index: TileIndex) {
    return `${index.x}-${index.y}-${index.z}`;
  }

  /** Returns a zoom level for a tile index */
  getTileZoom(index: TileIndex) {
    return index.z;
  }

  /** Returns additional metadata to add to tile, bbox by default */
  getTileMetadata(index: TileIndex): Record<string, any> {
    const {tileSize} = this.opts;
    return {bbox: tileToBoundingBox(this._viewport!, index.x, index.y, index.z, tileSize)};
  }

  /** Returns index of the parent tile */
  getParentIndex(index: TileIndex) {
    const x = Math.floor(index.x / 2);
    const y = Math.floor(index.y / 2);
    const z = index.z - 1;
    return {x, y, z};
  }

  // Returns true if any tile's visibility changed
  private updateTileStates() {
    const refinementStrategy = this.opts.refinementStrategy || STRATEGY_DEFAULT;

    const visibilities = new Array(this._cache.size);
    let i = 0;
    // Reset state
    for (const tile of this._cache.values()) {
      // save previous state
      visibilities[i++] = tile.isVisible;
      tile.isSelected = false;
      tile.isVisible = false;
      tile.isPrefetch = false;
    }
    // @ts-expect-error called only when _selectedTiles is already defined
    for (const tile of this._selectedTiles) {
      tile.isSelected = true;
      tile.isVisible = true;
    }
    for (const tile of this._prefetchTiles) {
      tile.isPrefetch = true;
    }

    // Strategy-specific state logic
    const tiles = Array.from(this._cache.values());
    if (
      refinementStrategy === STRATEGY_DEFAULT &&
      this.opts.lodStrategy === LOD_STRATEGY_COVERAGE
    ) {
      updateTileStateCoverage(tiles, this._getMinCoverageFallbackZoom());
    } else {
      (typeof refinementStrategy === 'function'
        ? refinementStrategy
        : STRATEGIES[refinementStrategy])(tiles);
    }

    i = 0;
    // Check if any visibility has changed
    for (const tile of this._cache.values()) {
      if (visibilities[i++] !== tile.isVisible) {
        return true;
      }
    }

    return false;
  }

  /* Private methods */

  private _getCullBounds = memoize(getCullBounds);

  private _getRequestPriority(tile: Tile2DHeader): number {
<<<<<<< HEAD
    // RequestScheduler loads lower priority values first.
    if (tile.isSelected) {
      return SELECTED_TILE_PRIORITY;
    }
    if (tile.isVisible) {
      return VISIBLE_TILE_PRIORITY;
    }
    if (tile.isPrefetch) {
      const prefetchPriority = this._prefetchTilePriority.get(tile.id);
      const zoomPriority =
        prefetchPriority === undefined ? this.getTileZoom(tile.index) : prefetchPriority;
      return PREFETCH_TILE_PRIORITY + zoomPriority;
    }
    return -1;
=======
    if (!tile.isSelected && !tile.isVisible) {
      return -1;
    }

    // RequestScheduler loads lower priority values first.
    const distance = this._getTileDistancePriority(tile);
    if (tile.isSelected) {
      return SELECTED_TILE_PRIORITY + distance;
    }
    return VISIBLE_TILE_PRIORITY + distance;
  }

  private _getTileDistancePriority(tile: Tile2DHeader): number {
    const {width, height} = this._viewport || {};
    if (!this._viewport || !width || !height) {
      return 0;
    }

    try {
      const points = this._getTileScreenCorners(tile.bbox);
      const center: [number, number] = [width / 2, height / 2];
      if (points.length === 4) {
        if (this._isPointInPolygon(center, points)) {
          return 0;
        }
        const distance = points.reduce((minDistance, point, i) => {
          const nextPoint = points[(i + 1) % points.length];
          return Math.min(
            minDistance,
            this._getPointToSegmentDistanceSquared(center, point, nextPoint)
          );
        }, Number.MAX_SAFE_INTEGER);
        return Math.min(distance, MAX_TILE_DISTANCE_PRIORITY);
      }
    } catch {
      // Some viewport/tile combinations are not projectable. Keep them valid but last in tier.
    }
    return MAX_TILE_DISTANCE_PRIORITY;
  }

  private _getTileScreenCorners(bbox: TileBoundingBox): [number, number][] {
    const coordinates: [number, number][] =
      'west' in bbox
        ? [
            [bbox.west, bbox.south],
            [bbox.east, bbox.south],
            [bbox.east, bbox.north],
            [bbox.west, bbox.north]
          ]
        : [
            [bbox.left, bbox.top],
            [bbox.right, bbox.top],
            [bbox.right, bbox.bottom],
            [bbox.left, bbox.bottom]
          ];

    return coordinates
      .map(coordinate => this._viewport!.project(coordinate))
      .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y)) as [number, number][];
  }

  private _isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
    let inside = false;
    const [x, y] = point;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  }

  private _getPointToSegmentDistanceSquared(
    point: [number, number],
    segmentStart: [number, number],
    segmentEnd: [number, number]
  ): number {
    const [x, y] = point;
    const [x1, y1] = segmentStart;
    const [x2, y2] = segmentEnd;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSquared = dx * dx + dy * dy;
    const t = lengthSquared
      ? Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / lengthSquared))
      : 0;
    const segmentX = x1 + t * dx;
    const segmentY = y1 + t * dy;
    const distanceX = x - segmentX;
    const distanceY = y - segmentY;
    return distanceX * distanceX + distanceY * distanceY;
>>>>>>> origin/master
  }

  private _pruneRequests(): void {
    const {maxRequests = 0} = this.opts;

    const abortCandidates: Tile2DHeader[] = [];
    let ongoingRequestCount = 0;
    for (const tile of this._cache.values()) {
      // Keep track of all the ongoing requests
      if (tile.isLoading) {
        ongoingRequestCount++;
        if (!tile.isSelected && !tile.isVisible && !tile.isPrefetch) {
          abortCandidates.push(tile);
        }
      }
    }

    while (maxRequests > 0 && ongoingRequestCount > maxRequests && abortCandidates.length > 0) {
      // There are too many ongoing requests, so abort some that are unselected
      const tile = abortCandidates.shift()!;
      tile.abort();
      ongoingRequestCount--;
    }
  }

  // This needs to be called every time some tiles have been added/removed from cache
  private _rebuildTree() {
    const {_cache} = this;

    // Reset states
    for (const tile of _cache.values()) {
      tile.parent = null;
      if (tile.children) {
        tile.children.length = 0;
      }
    }

    // Rebuild tree
    for (const tile of _cache.values()) {
      const parent = this._getNearestAncestor(tile);
      tile.parent = parent;
      if (parent?.children) {
        parent.children.push(tile);
      }
    }
  }

  /**
   * Clear tiles that are not visible when the cache is full
   */
  /* eslint-disable complexity */
  private _resizeCache() {
    const {_cache, opts} = this;

    const maxCacheSize =
      opts.maxCacheSize ??
      // @ts-expect-error called only when selectedTiles is initialized
      (opts.maxCacheByteSize !== null ? Infinity : DEFAULT_CACHE_SCALE * this.selectedTiles.length);
    const maxCacheByteSize = opts.maxCacheByteSize ?? Infinity;

    const overflown = _cache.size > maxCacheSize || this._cacheByteSize > maxCacheByteSize;

    if (overflown) {
      this._evictTiles(tile => !tile.isVisible && !tile.isSelected && !tile.isPrefetch);

      if (_cache.size > maxCacheSize || this._cacheByteSize > maxCacheByteSize) {
        this._evictTiles(tile => !tile.isVisible && !tile.isSelected);
      }
      this._rebuildTree();
      this._dirty = true;
    }
    if (this._dirty) {
      // sort by zoom level so that smaller tiles are displayed on top
      this._tiles = Array.from(this._cache.values()).sort((t1, t2) => t1.zoom - t2.zoom);

      this._dirty = false;
    }
  }
  /* eslint-enable complexity */

  private _evictTiles(shouldEvict: (tile: Tile2DHeader) => boolean): void {
    const {_cache, opts} = this;
    const maxCacheSize =
      opts.maxCacheSize ??
      // @ts-expect-error called only when selectedTiles is initialized
      (opts.maxCacheByteSize !== null ? Infinity : DEFAULT_CACHE_SCALE * this.selectedTiles.length);
    const maxCacheByteSize = opts.maxCacheByteSize ?? Infinity;

    for (const [id, tile] of _cache) {
      if (shouldEvict(tile)) {
        this._cacheByteSize -= opts.maxCacheByteSize !== null ? tile.byteLength : 0;
        _cache.delete(id);
        this.opts.onTileUnload?.(tile);
      }
      if (_cache.size <= maxCacheSize && this._cacheByteSize <= maxCacheByteSize) {
        break;
      }
    }
  }

  private _getTile(index: TileIndex, create: true): Tile2DHeader;
  private _getTile(index: TileIndex, create?: false): Tile2DHeader | undefined;
  private _getTile(index: TileIndex, create?: boolean): Tile2DHeader | undefined {
    const id = this.getTileId(index);
    let tile = this._cache.get(id);
    let needsReload = false;

    if (!tile && create) {
      tile = new Tile2DHeader(index);
      Object.assign(tile, this.getTileMetadata(tile.index));
      Object.assign(tile, {id, zoom: this.getTileZoom(tile.index)});
      needsReload = true;
      this._cache.set(id, tile);
      this._dirty = true;
    } else if (tile && tile.needsReload) {
      needsReload = true;
    }
    if (tile && needsReload) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      tile.loadData({
        getData: this.opts.getTileData,
<<<<<<< HEAD
        getPriority: this._getRequestPriority.bind(this),
=======
        getRequestPriority: this._getRequestPriority.bind(this),
>>>>>>> origin/master
        requestScheduler: this._requestScheduler,
        onLoad: this.onTileLoad,
        onError: this.opts.onTileError
      });
    }

    return tile;
  }

  private _updatePrefetchTiles(): void {
    this._prefetchTiles = [];
    this._prefetchTilePriority.clear();
    if (this.opts.lodStrategy !== LOD_STRATEGY_COVERAGE || !this._selectedTiles) {
      return;
    }

    const minZoom = this._getMinCoverageZoom();
    const fallbackZoom = this._getMinCoverageFallbackZoom();
    const seen = new Set<string>();
    for (const selectedTile of this._selectedTiles) {
      const selectedZoom = this.getTileZoom(selectedTile.index);
      if (selectedZoom > minZoom) {
        this._updateCoveragePrefetchTiles(selectedTile.index, minZoom, fallbackZoom, seen);
      }
    }
  }

  private _updateCoveragePrefetchTiles(
    selectedIndex: TileIndex,
    minZoom: number,
    fallbackZoom: number,
    seen: Set<string>
  ): void {
    const selectedZoom = this.getTileZoom(selectedIndex);
    const coverageZoom = Math.max(minZoom, selectedZoom - COVERAGE_ZOOM_DELTA);
    const coverageZooms = [coverageZoom, minZoom];
    if (fallbackZoom < minZoom) {
      coverageZooms.push(fallbackZoom);
    }

    for (let priority = 0; priority < coverageZooms.length; priority++) {
      const index = this._getAncestorIndex(selectedIndex, coverageZooms[priority]);
      this._addCoveragePrefetchTile(index, priority, seen);
    }
  }

  private _addCoveragePrefetchTile(
    index: TileIndex,
    prefetchPriority: number,
    seen: Set<string>
  ): void {
    const id = this.getTileId(index);
    const existingPriority = this._prefetchTilePriority.get(id);
    if (existingPriority === undefined || prefetchPriority < existingPriority) {
      this._prefetchTilePriority.set(id, prefetchPriority);
    }
    if (seen.has(id)) {
      return;
    }
    seen.add(id);

    const tile = this._getTile(index, true);
    if (tile && !tile.isSelected) {
      tile.isPrefetch = true;
      this._prefetchTiles.push(tile);
    }
  }

  private _getAncestorIndex(index: TileIndex, zoom: number): TileIndex {
    let ancestor = index;
    while (this.getTileZoom(ancestor) > zoom) {
      ancestor = this.getParentIndex(ancestor);
    }
    return ancestor;
  }

  private _getMinCoverageZoom(): number {
    const minZoom = this._getMinCoverageFallbackZoom();
    if (this._viewport?.resolution) {
      return Math.max(minZoom, MIN_RESOLUTION_COVERAGE_ZOOM);
    }
    return minZoom;
  }

  private _getMinCoverageFallbackZoom(): number {
    const minZoom = this._minZoom ?? 0;
    if (this._viewport?.resolution) {
      return Math.max(minZoom, MIN_RESOLUTION_FALLBACK_ZOOM);
    }
    return minZoom;
  }

  _getNearestAncestor(tile: Tile2DHeader): Tile2DHeader | null {
    const {_minZoom = 0} = this;

    let index = tile.index;
    while (this.getTileZoom(index) > _minZoom) {
      index = this.getParentIndex(index);
      const parent = this._getTile(index);
      if (parent) {
        return parent;
      }
    }
    return null;
  }
}

/* -- Refinement strategies --*/
/* eslint-disable max-depth */

// For all the selected && pending tiles:
// - pick the closest ancestor as placeholder
// - if no ancestor is visible, pick the closest children as placeholder
function updateTileStateDefault(allTiles: Tile2DHeader[]) {
  for (const tile of allTiles) {
    tile.state = 0;
  }
  for (const tile of allTiles) {
    if (tile.isSelected && !getPlaceholderInAncestors(tile)) {
      getPlaceholderInChildren(tile);
    }
  }
  for (const tile of allTiles) {
    tile.isVisible = Boolean(tile.state! & TILE_STATE_VISIBLE);
  }
}

// Coverage LOD intentionally keeps coarse ancestors available. For pending selected tiles,
// render only immediate loaded children above the ancestor so the displayed LOD steps down
// gradually instead of jumping between stale deep children and very coarse coverage.
function updateTileStateCoverage(allTiles: Tile2DHeader[], minPlaceholderZoom: number) {
  for (const tile of allTiles) {
    tile.state = 0;
  }
  for (const tile of allTiles) {
    if (tile.isSelected) {
      if (isTileLoaded(tile)) {
        tile.state! |= TILE_STATE_VISIBLE;
      } else {
        setPlaceholderInImmediateChildren(tile);
        getPlaceholderInAncestors(tile, minPlaceholderZoom);
      }
    }
  }
  for (const tile of allTiles) {
    tile.isVisible = Boolean(tile.state! & TILE_STATE_VISIBLE);
  }
}

// Until a selected tile and all its selected siblings are loaded, use the closest ancestor as placeholder
function updateTileStateReplace(allTiles: Tile2DHeader[]) {
  for (const tile of allTiles) {
    tile.state = 0;
  }
  for (const tile of allTiles) {
    if (tile.isSelected) {
      getPlaceholderInAncestors(tile);
    }
  }
  // Always process parents first
  const sortedTiles = Array.from(allTiles).sort((t1, t2) => t1.zoom - t2.zoom);
  for (const tile of sortedTiles) {
    tile.isVisible = Boolean(tile.state! & TILE_STATE_VISIBLE);

    if (tile.children && (tile.isVisible || tile.state! & TILE_STATE_VISITED)) {
      // If the tile is rendered, or if the tile has been explicitly hidden, hide all of its children
      for (const child of tile.children) {
        child.state = TILE_STATE_VISITED;
      }
    } else if (tile.isSelected) {
      getPlaceholderInChildren(tile);
    }
  }
}

function isTileLoaded(tile: Tile2DHeader): boolean {
  return tile.isLoaded || Boolean(tile.content);
}

// Walk up the tree until we find one ancestor that is loaded. Returns true if successful.
function getPlaceholderInAncestors(startTile: Tile2DHeader, minZoom = -Infinity) {
  let tile: Tile2DHeader | null = startTile;
  while (tile && tile.zoom >= minZoom) {
    if (isTileLoaded(tile)) {
      tile.state! |= TILE_STATE_VISIBLE;
      return true;
    }
    tile = tile.parent;
  }
  return false;
}

function setPlaceholderInImmediateChildren(tile: Tile2DHeader): void {
  for (const child of tile.children || []) {
    if (isTileLoaded(child) && child.zoom === tile.zoom + 1) {
      child.state! |= TILE_STATE_VISIBLE;
    }
  }
}

// Recursively set children as placeholder
function getPlaceholderInChildren(tile) {
  for (const child of tile.children) {
    if (isTileLoaded(child)) {
      child.state |= TILE_STATE_VISIBLE;
    } else {
      getPlaceholderInChildren(child);
    }
  }
}
