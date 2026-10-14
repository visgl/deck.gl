// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Viewport} from '@deck.gl/core';

import {RequestScheduler, type TileSource, type TileSourceMetadata} from '@loaders.gl/loader-utils';
import {Stats} from '@probe.gl/stats';
import type {Tileset2DAdapter} from './adapter';
import {Matrix4, equals, NumericArray} from '@math.gl/core';

import {Tile2DHeader} from './tile-2d-header';

import {getTileIndices, tileToBoundingBox, getCullBounds, transformBox} from './utils';
import {Bounds, TileBoundingBox, TileIndex, ZRange} from './types';
import {TileLoadProps} from './types';
import {memoize} from './memoize';
import {refineTileStates} from './refinement';

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

/** Shows directly selected tiles without fallback refinement. */
export const STRATEGY_NEVER = 'never';
/** Suppresses overlap between visible ancestors and descendants. */
export const STRATEGY_REPLACE = 'no-overlap';
/** Chooses the closest available loaded content while requests are pending. */
export const STRATEGY_DEFAULT = 'best-available';

/** Refines selection and visibility for one consumer using mutable view-local tile flags. */
export type RefinementStrategyFunction = (tiles: Tile2DHeader[]) => void;
/** Built-in refinement mode or custom per-consumer visibility callback. */
export type RefinementStrategy =
  | 'never'
  | 'no-overlap'
  | 'best-available'
  | RefinementStrategyFunction;

const DEFAULT_CACHE_SCALE = 5;
const SELECTED_TILE_PRIORITY = 0;
const VISIBLE_TILE_PRIORITY = 1e8;
const MAX_TILE_DISTANCE_PRIORITY = VISIBLE_TILE_PRIORITY - SELECTED_TILE_PRIORITY - 1;

/** Loading, traversal, and cache options shared by the default view and registered consumers. */
export type Tileset2DProps<DataT = any, ViewStateT = Viewport> = {
  /** Optional traversal adapter for custom tile pyramids. */
  adapter?: Tileset2DAdapter<ViewStateT> | null;
  /** Source owning metadata and content loading. */
  tileSource?: TileSource;
  /** `getTileData` is called to retrieve the data of each tile. */
  getTileData?: (props: TileLoadProps) => Promise<DataT | null> | DataT | null;

  /** The bounding box of the layer's data. */
  extent?: number[] | null;
  /** The pixel dimension of the tiles, usually a power of 2. */
  tileSize?: number;
  /** The max zoom level of the layer's data. @default null */
  maxZoom?: number | null;
  /** The min zoom level of the source data. @default null */
  minZoom?: number | null;
  /** Tile-count high-water mark; required entries can exceed it. Defaults to 100 for independent consumers. */
  maxCacheSize?: number | null;
  /** The maximum memory used for caching tiles. @default null */
  maxCacheByteSize?: number | null;
  /** How the tile layer refines the visibility of tiles. @default 'best-available' */
  refinementStrategy?: RefinementStrategy;
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
};

/** Default options; cache capacity preserves the legacy default-view policy. */
export const DEFAULT_TILESET2D_PROPS: Omit<
  Required<Tileset2DProps>,
  'getTileData' | 'tileSource'
> = {
  adapter: null,
  extent: null,
  tileSize: 512,

  maxZoom: null,
  minZoom: null,
  maxCacheSize: null,
  maxCacheByteSize: null,
  refinementStrategy: 'best-available',
  zRange: null,
  maxRequests: 6,
  debounceTime: 0,
  zoomOffset: 0,
  visibleMinZoom: null,
  visibleMaxZoom: null,

  onTileLoad: () => {},
  onTileUnload: () => {},
  onTileError: () => {}
};

/** Subscription callbacks emitted by {@link Tileset2D}. */
export type Tileset2DListener<DataT = any> = {
  /** Fired after a tile loads successfully. */
  onTileLoad?: (tile: Tile2DHeader<DataT>) => void;
  /** Fired after a tile request fails. */
  onTileError?: (error: any, tile: Tile2DHeader<DataT>) => void;
  /** Fired after a tile is evicted from cache. */
  onTileUnload?: (tile: Tile2DHeader<DataT>) => void;
  /** Fired when metadata or effective configuration changes. */
  onUpdate?: () => void;
  /** Fired when asynchronous metadata initialization fails. */
  onError?: (error: Error) => void;
  /** Fired after live tileset counters are recomputed. */
  onStatsChange?: (stats: Stats) => void;
};

/** Per-consumer tile sets retained by the shared cache. */
type ConsumerState<DataT = any> = {
  /** Tiles selected for this consumer's most recent traversal. */
  selectedTiles: Set<Tile2DHeader<DataT>>;
  /** Tiles currently marked render-visible for this consumer. */
  visibleTiles: Set<Tile2DHeader<DataT>>;
};
/** Tile-content cache with a compatibility default view and independent registered consumers. */
export class Tileset2D<DataT = any, ViewStateT = Viewport> {
  /** Live counters describing shared tileset state. */
  readonly stats: Stats;

  /** Cached metadata returned by the backing TileSource, if any. */
  protected sourceMetadata: TileSourceMetadata | null = null;

  /** Subscribers watching tileset lifecycle events. */
  private _listeners = new Set<Tileset2DListener<DataT>>();

  /** Selected and visible tiles tracked per consumer. */
  private _consumers = new Map<symbol, ConsumerState<DataT>>();

  /** Options provided by the caller that take precedence over source metadata. */
  private _explicitOptionKeys = new Set<string>();

  /** Caller-provided options before metadata-derived overrides are applied. */
  private _baseOpts: Partial<Tileset2DProps<DataT, ViewStateT>> = {};

  /** Derived overrides sourced from TileSource metadata. */
  private _sourceMetadataOverrides: Partial<Tileset2DProps<DataT, ViewStateT>> = {};

  /** Option names explicitly set by the caller. */
  private _sourceMetadataGeneration = 0;

  /** Cumulative number of tiles evicted from the shared cache. */
  private _unloadedTileCount: number;
  /** Revision of options affecting tile traversal. */
  traversalRevision = 0;
  /** Most recent traversal viewport used for tile metadata. */
  private _tileViewport: Viewport | null = null;

  /** Effective defaults, source metadata, and caller options. */
  protected opts: Required<Tileset2DProps<DataT, ViewStateT>>;
  /** Scheduler coordinating tile loads for every consumer. */
  private _requestScheduler: RequestScheduler;
  /** Tile entries keyed by ID and ordered from least to most recently requested. */
  private _cache: Map<string, Tile2DHeader>;
  /** Whether cache changes require rebuilding tile relationships and the sorted tile list. */
  private _dirty: boolean;
  /** Cached tiles sorted by zoom for rendering and refinement. */
  private _tiles: Tile2DHeader[];

  /** Estimated bytes retained in cached content. */
  private _cacheByteSize: number;
  /** Last viewport used by the compatibility default consumer. */
  private _viewport: Viewport | null;
  /** Elevation range used by the default consumer. */
  private _zRange: ZRange | null;
  /** Tiles selected by the compatibility default consumer, or null before its first update. */
  private _selectedTiles: Tile2DHeader[] | null;
  /** Default-consumer visibility revision returned by update. */
  private _frameNumber: number;
  /** Model transform used by the default consumer. */
  private _modelMatrix: Matrix4;
  /** Inverse transform used to select tiles for the default consumer. */
  private _modelMatrixInverse: Matrix4;

  /** Resolved maximum source zoom. */
  private _maxZoom?: number;
  /** Resolved minimum source zoom. */
  private _minZoom?: number;

  /** Internal load callback that updates accounting and dispatches subscriptions. */
  private onTileLoad: (tile: Tile2DHeader) => void;

  /**
   * Takes in a function that returns tile data, a cache size, and a max and a min zoom level.
   * Cache size defaults to 5 * number of tiles in the current viewport
   */
  constructor(opts: Tileset2DProps<DataT, ViewStateT>) {
    this.opts = {...DEFAULT_TILESET2D_PROPS, ...opts} as Required<
      Tileset2DProps<DataT, ViewStateT>
    >;
    this.stats = new Stats({id: 'Tileset2D'});

    this.onTileLoad = this._handleTileLoad.bind(this);

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
    this._frameNumber = 0;

    this._modelMatrix = new Matrix4();
    this._modelMatrixInverse = new Matrix4();
    this._unloadedTileCount = 0;
    this.setOptions(opts);
    this._updateStats();
  }

  /* Public API */
  /** Creates a tileset backed by source-owned metadata and loading. */
  static fromTileSource<DataT = any>(
    tileSource: TileSource,
    opts: Partial<Tileset2DProps<DataT>> = {}
  ): Tileset2D<DataT> {
    return new Tileset2D({...opts, tileSource});
  }

  /** Returns or creates a cache entry for a consumer. */
  getTile(index: TileIndex, create: true): Tile2DHeader<DataT>;
  /** Looks up a cache entry and optionally creates and requests its content. */
  getTile(index: TileIndex, create?: false): Tile2DHeader<DataT> | undefined;
  /** Looks up a cache entry and optionally creates and requests its content. */
  getTile(index: TileIndex, create = false): Tile2DHeader<DataT> | undefined {
    return create ? this._getTile(index, true) : this._getTile(index);
  }

  /** Synchronizes cache order after traversal or eviction. */
  private _syncTiles(): void {
    this._tiles = Array.from(this._cache.values()).sort((a, b) => a.zoom - b.zoom);
  }
  /** All retained cache entries sorted by zoom. */
  get tiles() {
    return this._tiles;
  }

  /** Default-view selection when active, otherwise the union of registered consumers; null before use. */
  get selectedTiles(): Tile2DHeader[] | null {
    return (
      this._selectedTiles ||
      (this._consumers.size ? Array.from(this._getSelectedTilesUnion()) : null)
    );
  }

  /** Whether all tiles selected by this consumer have settled. */
  get isLoaded(): boolean {
    return this._selectedTiles !== null && this._selectedTiles.every(tile => tile.isLoaded);
  }

  /** Whether selected content has been invalidated or cancelled. */
  get needsReload(): boolean {
    return this._selectedTiles !== null && this._selectedTiles.some(tile => tile.needsReload);
  }

  /** Updates tileset options and reapplies TileSource metadata overrides. */
  setOptions(
    opts: Partial<Tileset2DProps<DataT, ViewStateT>>,
    {
      replace = false
    }: {
      /** Replace prior caller options rather than merge into them. */ replace?: boolean;
    } = {}
  ): void {
    const previousSource = this._baseOpts.tileSource;
    const previousMaxRequests = this.opts.maxRequests;
    const previousDebounceTime = this.opts.debounceTime;
    if (replace) {
      this._baseOpts = {};
      this._explicitOptionKeys.clear();
    }
    this._rememberExplicitOptions(opts);
    this._baseOpts = {...this._baseOpts, ...opts};
    const nextSource = this._baseOpts.tileSource;
    const sourceChanged = previousSource !== nextSource;
    if (sourceChanged) {
      this.sourceMetadata = null;
      this._sourceMetadataOverrides = {};
      this._sourceMetadataGeneration++;
    } else {
      this._sourceMetadataOverrides = this._getMetadataOverrides(this.sourceMetadata);
    }
    this._applyResolvedOptions();
    this.traversalRevision++;
    if (
      previousMaxRequests !== this.opts.maxRequests ||
      previousDebounceTime !== this.opts.debounceTime
    ) {
      this._requestScheduler = new RequestScheduler({
        throttleRequests: this.opts.maxRequests > 0 || this.opts.debounceTime > 0,
        maxRequests: this.opts.maxRequests,
        debounceTime: this.opts.debounceTime
      });
    }
    if (nextSource && sourceChanged) {
      this._initializeTileSource(nextSource, this._sourceMetadataGeneration).catch(() => {});
    }
    if (sourceChanged && this._cache.size > 0) this.reloadAll();
    this._viewport = null;
    this._notifyUpdate();
  }

  // Clean up any outstanding tile requests.
  /** Aborts requests and releases cache entries and consumer registrations. */
  finalize(): void {
    for (const tile of this._cache.values()) {
      if (tile.isLoading) {
        tile.abort();
      }
    }
    this._sourceMetadataGeneration++;
    this._cache.clear();
    this._tiles = [];
    this._selectedTiles = null;
    this._consumers.clear();
    this._cacheByteSize = 0;
    this._updateStats();
  }

  /** Marks required tiles stale and unloads unused cache entries. */
  reloadAll(): void {
    if (this._consumers.size === 0 && this._selectedTiles !== null) {
      // Legacy TileLayer retains its render list until the next traversal adds tiles.
      for (const [id, tile] of this._cache) {
        if (this._selectedTiles.includes(tile)) {
          tile.setNeedsReload();
        } else {
          this._cache.delete(id);
        }
      }
      this._cacheByteSize = this._getCacheByteSize();
      this._updateStats();
      return;
    }
    for (const id of this._cache.keys()) {
      const tile = this._cache.get(id) as Tile2DHeader;
      if (!this._getSelectedTilesUnion().has(tile) && !this._getVisibleTilesUnion().has(tile)) {
        this._cache.delete(id);
        tile.abort();
        this._handleTileUnload(tile);
        this._dirty = true;
      } else {
        tile.setNeedsReload();
      }
    }
    this._cacheByteSize = this._getCacheByteSize();
    this.prepareTiles();
    this._updateStats();
  }

  /**
   * Update the cache with the given viewport and model matrix and triggers callback onUpdate.
   */
  update(
    viewport: Viewport,
    {
      zRange,
      modelMatrix
    }: {
      /** Minimum and maximum elevations used for tile selection and culling. */
      zRange: ZRange | null;
      /** Optional transform from layer coordinates to world coordinates. */
      modelMatrix: NumericArray | null;
    } = {
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

      if (this._dirty) {
        // Some new tiles are added
        this._rebuildTree();
      }
      // Check for needed reloads explicitly even if the view/matrix has not changed.
    } else if (this.needsReload) {
      this._selectedTiles = this._selectedTiles!.map(tile => this._getTile(tile.index, true));
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

    this._updateStats();
    return this._frameNumber;
  }

  // eslint-disable-next-line complexity
  /** Checks the default consumer visibility and optional screen-space culling bounds. */
  isTileVisible(
    tile: Tile2DHeader,
    cullRect?: {
      /** Horizontal tile index or screen-space position in the enclosing coordinate system. */
      x: number;
      /** Vertical tile index or screen-space position in the enclosing coordinate system. */
      y: number;
      /** Screen-space width in pixels. */
      width: number;
      /** Screen-space height in pixels. */
      height: number;
    },
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
    viewState,
    maxZoom,
    minZoom,
    zRange,
    modelMatrix,
    modelMatrixInverse
  }: {
    /** Deck.gl viewport used for tile selection. */
    viewport?: Viewport;
    /** Adapter-specific view representation used for tile selection. */
    viewState?: ViewStateT;
    /** Maximum source zoom to request. */
    maxZoom?: number;
    /** Minimum source zoom to request. */
    minZoom?: number;
    /** Minimum and maximum elevations used for tile selection and culling. */
    zRange: ZRange | null;
    /** Tile dimensions in pixels. */
    tileSize?: number;
    /** Optional transform from layer coordinates to world coordinates. */
    modelMatrix?: Matrix4;
    /** Inverse layer transform used during traversal. */
    modelMatrixInverse?: Matrix4;
    /** Zoom adjustment applied when selecting source tiles. */
    zoomOffset?: number;
  }): TileIndex[] {
    const {tileSize, extent, zoomOffset, visibleMinZoom, visibleMaxZoom} = this.opts;
    const currentViewport = viewport || (viewState as Viewport);
    if (!this.opts.adapter && !(currentViewport instanceof Viewport)) {
      throw new Error('Tileset2D requires an adapter for non-viewport traversal.');
    }
    this._tileViewport = currentViewport;
    if (this.opts.adapter) {
      return this.opts.adapter.getTileIndices({
        viewState: (viewState || viewport) as ViewStateT,
        tileSize,
        extent: extent as Bounds,
        zoomOffset,
        visibleMinZoom,
        visibleMaxZoom,
        maxZoom,
        minZoom,
        zRange,
        modelMatrix,
        modelMatrixInverse
      });
    }
    return getTileIndices({
      viewport: currentViewport,
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
    const viewport = this._tileViewport || this._viewport!;
    return {
      bbox: this.opts.adapter
        ? this.opts.adapter.getTileBoundingBox({viewState: viewport as ViewStateT, tileSize}, index)
        : tileToBoundingBox(viewport, index.x, index.y, index.z, tileSize)
    };
  }

  /** Returns index of the parent tile */
  getParentIndex(index: TileIndex) {
    const x = Math.floor(index.x / 2);
    const y = Math.floor(index.y / 2);
    const z = index.z - 1;
    return {x, y, z};
  }

  // Returns true if any tile's visibility changed
  /** Updates legacy selection and refinement flags without changing independent consumers. */
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
    }
    // @ts-expect-error called only when _selectedTiles is already defined
    for (const tile of this._selectedTiles) {
      tile.isSelected = true;
      tile.isVisible = true;
    }

    // Strategy-specific state logic
    const tiles = Array.from(this._cache.values());
    if (typeof refinementStrategy === 'function') refinementStrategy(tiles);
    else refineTileStates(tiles, refinementStrategy, tile => tile);

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

  /** Memoized conversion of screen culling rectangles to world bounds. */
  private _getCullBounds = memoize(getCullBounds);

  /** Prioritizes requested tiles while retaining the default-view center-distance ordering. */
  private _getRequestPriority(tile: Tile2DHeader): number {
    if (this._consumers.size)
      return this._getSelectedTilesUnion().has(tile)
        ? 0
        : this._getVisibleTilesUnion().has(tile)
          ? VISIBLE_TILE_PRIORITY
          : -1;
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

  /** Computes distance from the viewport center to the projected tile footprint. */
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

  /** Projects the four tile corners into default-view screen coordinates. */
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

  /** Tests whether a screen point lies inside the projected tile footprint. */
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

  /** Computes squared screen distance to a tile footprint edge. */
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
  }

  /** Cancels low-priority requests when consumers no longer need them. */
  private _pruneRequests(): void {
    const {maxRequests = 0} = this.opts;
    const selectedTiles = this._getSelectedTilesUnion();
    const visibleTiles = this._getVisibleTilesUnion();
    const abortCandidates: Tile2DHeader<DataT>[] = [];
    let ongoingRequestCount = 0;

    for (const tile of this._cache.values()) {
      if (tile.isLoading) {
        ongoingRequestCount++;
        if (!selectedTiles.has(tile) && !visibleTiles.has(tile)) {
          abortCandidates.push(tile);
        }
      }
    }

    while (maxRequests > 0 && ongoingRequestCount > maxRequests && abortCandidates.length > 0) {
      const tile = abortCandidates.shift();
      if (tile) {
        tile.abort();
      }
      ongoingRequestCount--;
    }
  }

  // This needs to be called every time some tiles have been added/removed from cache
  /** Rebuilds parent and child links among retained cache entries. */
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

  /** Evicts unused cached tiles when configured cache limits are exceeded. */
  private _resizeCache(): void {
    const maxCacheSize =
      this.opts.maxCacheSize ??
      (this._viewport
        ? this.opts.maxCacheByteSize !== null
          ? Infinity
          : DEFAULT_CACHE_SCALE * (this.selectedTiles?.length || 1)
        : 100);
    const maxCacheByteSize = this.opts.maxCacheByteSize ?? Infinity;
    const visibleTiles = this._getVisibleTilesUnion();
    const selectedTiles = this._getSelectedTilesUnion();
    const overflown = this._cache.size > maxCacheSize || this._cacheByteSize > maxCacheByteSize;

    if (overflown) {
      for (const [id, tile] of this._cache) {
        if (!visibleTiles.has(tile) && !selectedTiles.has(tile)) {
          this._cache.delete(id);
          tile.abort();
          this._cacheByteSize = this._getCacheByteSize();
          this._handleTileUnload(tile);
        }
        if (this._cache.size <= maxCacheSize && this._cacheByteSize <= maxCacheByteSize) {
          break;
        }
      }
      this._dirty = true;
    }

    if (this._dirty) {
      this._rebuildTree();
      this._syncTiles();
      this._dirty = false;
    }
  }
  /* eslint-enable complexity */

  /** Compatibility lookup used by default-view traversal and subclass helpers. */
  private _getTile(index: TileIndex, create: true): Tile2DHeader;
  /** Compatibility lookup used by default-view traversal and subclass helpers. */
  private _getTile(index: TileIndex, create?: false): Tile2DHeader | undefined;
  /** Compatibility lookup used by default-view traversal and subclass helpers. */
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
    if (tile && create) this._touchTile(id, tile);
    if (tile && needsReload) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      tile.loadData({
        getData: this.opts.getTileData,
        getRequestPriority: this._getRequestPriority.bind(this),
        requestScheduler: this._requestScheduler,
        onLoad: this.onTileLoad,
        onError: this._handleTileError.bind(this)
      });
    }

    this._updateStats();
    return tile;
  }

  /** Finds the closest retained ancestor of a tile. */
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

  /** Estimated byte size of all tile content currently retained in cache. */
  get cacheByteSize(): number {
    return this._cacheByteSize;
  }

  /** Union of tiles contributing to the visible result across all consumers and views, including unloaded selected tiles. */
  get visibleTiles(): Tile2DHeader<DataT>[] {
    const union = this._getVisibleTilesUnion();
    for (const tile of this._getSelectedTilesUnion()) {
      union.add(tile);
    }
    return Array.from(union);
  }

  /** Tiles currently loading anywhere in the shared cache. */
  get loadingTiles(): Tile2DHeader<DataT>[] {
    return Array.from(this._cache.values()).filter(tile => tile.isLoading);
  }

  /** Cached tiles whose latest request has not settled; distinct from the cumulative unload stat. */
  get unloadedTiles(): Tile2DHeader<DataT>[] {
    return Array.from(this._cache.values()).filter(tile => !tile.isLoaded);
  }

  /** Maximum resolved zoom level after applying metadata and explicit options. */
  get maxZoom(): number | undefined {
    return this._maxZoom;
  }

  /** Minimum resolved zoom level after applying metadata and explicit options. */
  get minZoom(): number | undefined {
    return this._minZoom;
  }

  /** Active refinement strategy for placeholder handling. */
  get refinementStrategy(): RefinementStrategy {
    return this.opts.refinementStrategy || STRATEGY_DEFAULT;
  }

  /** Adapter currently used for traversal and tile metadata. */
  get adapter(): Tileset2DAdapter<ViewStateT> | null {
    return this.opts.adapter;
  }

  /** Subscribes to tileset lifecycle events. */
  subscribe(listener: Tileset2DListener<DataT>): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  /** Registers a consumer so cache pruning can account for its selected tiles. */
  attachConsumer(id: symbol): void {
    this._consumers.set(id, {selectedTiles: new Set(), visibleTiles: new Set()});
    this._updateStats();
  }

  /** Unregisters a consumer and prunes unused requests and tiles. */
  detachConsumer(id: symbol): void {
    this._consumers.delete(id);
    this._pruneRequests();
    this._resizeCache();
    this._updateStats();
  }

  /** Updates the selected and visible tile sets for one consumer. */
  updateConsumer(
    id: symbol,
    selectedTiles: Tile2DHeader<DataT>[],
    visibleTiles: Tile2DHeader<DataT>[]
  ): void {
    this._consumers.set(id, {
      selectedTiles: new Set(selectedTiles),
      visibleTiles: new Set(visibleTiles)
    });
    this._pruneRequests();
    this._resizeCache();
    this._updateStats();
  }

  /** Rebuilds parent/child links if the cache changed since the last traversal. */
  prepareTiles(): void {
    if (this._dirty) {
      this._rebuildTree();
      this._syncTiles();
      this._dirty = false;
    }
  }

  /** Loads metadata from a TileSource and reapplies derived option overrides. */
  private async _initializeTileSource(tileSource: TileSource, generation: number): Promise<void> {
    try {
      const metadata = await tileSource.getMetadata();
      if (generation !== this._sourceMetadataGeneration || tileSource !== this._baseOpts.tileSource)
        return;
      this.traversalRevision++;
      this._viewport = null;
      this.sourceMetadata = metadata;
      this._sourceMetadataOverrides = this._getMetadataOverrides(this.sourceMetadata);
      this._applyResolvedOptions();
      this._notifyUpdate();
    } catch (error: any) {
      if (generation !== this._sourceMetadataGeneration || tileSource !== this._baseOpts.tileSource)
        return;
      const normalizedError =
        error instanceof Error ? error : new Error(`TileSource metadata error: ${String(error)}`);
      this._notifyError(normalizedError);
    }
  }

  /** Tracks which options were explicitly set by the caller. */
  private _rememberExplicitOptions(opts: Partial<Tileset2DProps<DataT, ViewStateT>>): void {
    for (const key of Object.keys(opts)) {
      this._explicitOptionKeys.add(key);
    }
  }

  /** Resolves defaults, metadata overrides, and caller options into runtime settings. */
  private _applyResolvedOptions(): void {
    const resolvedOpts = {
      ...DEFAULT_TILESET2D_PROPS,
      getTileData: () => null,
      ...this._sourceMetadataOverrides,
      ...this._baseOpts
    } as Required<Tileset2DProps<DataT, ViewStateT>>;

    if (resolvedOpts.tileSource) {
      const tileSource = resolvedOpts.tileSource;
      resolvedOpts.getTileData = (loadProps: TileLoadProps) =>
        tileSource.getTileData(loadProps) as Promise<DataT | null> | DataT | null;
    }

    this.opts = resolvedOpts;
    this._maxZoom =
      typeof this.opts.maxZoom === 'number' && Number.isFinite(this.opts.maxZoom)
        ? Math.floor(this.opts.maxZoom)
        : undefined;
    this._minZoom =
      typeof this.opts.minZoom === 'number' && Number.isFinite(this.opts.minZoom)
        ? Math.ceil(this.opts.minZoom)
        : undefined;
  }

  /** Maps TileSource metadata into supported tileset options. */
  private _getMetadataOverrides(
    metadata: TileSourceMetadata | null
  ): Partial<Tileset2DProps<DataT, ViewStateT>> {
    if (!metadata) {
      return {};
    }
    const overrides: Partial<Tileset2DProps<DataT, ViewStateT>> = {};
    if (!this._explicitOptionKeys.has('minZoom') && Number.isFinite(metadata.minZoom)) {
      overrides.minZoom = metadata.minZoom;
    }
    if (!this._explicitOptionKeys.has('maxZoom') && Number.isFinite(metadata.maxZoom)) {
      overrides.maxZoom = metadata.maxZoom;
    }
    if (!this._explicitOptionKeys.has('extent') && metadata.boundingBox) {
      overrides.extent = [
        metadata.boundingBox[0][0],
        metadata.boundingBox[0][1],
        metadata.boundingBox[1][0],
        metadata.boundingBox[1][1]
      ];
    }
    return overrides;
  }

  /** Handles successful tile loads. */
  private _handleTileLoad(tile: Tile2DHeader<DataT>): void {
    this.opts.onTileLoad?.(tile);
    this._cacheByteSize = this._getCacheByteSize();
    if (this._consumers.size || this.opts.maxCacheByteSize !== null) this._resizeCache();
    for (const listener of this._listeners) {
      listener.onTileLoad?.(tile);
    }
    this._updateStats();
  }

  /** Handles tile load failures. */
  private _handleTileError(error: any, tile: Tile2DHeader<DataT>): void {
    this.opts.onTileError?.(error, tile);
    for (const listener of this._listeners) {
      listener.onTileError?.(error, tile);
    }
    this._updateStats();
  }

  /** Handles tile eviction from cache. */
  private _handleTileUnload(tile: Tile2DHeader<DataT>): void {
    this._unloadedTileCount++;
    this.opts.onTileUnload?.(tile);
    for (const listener of this._listeners) {
      listener.onTileUnload?.(tile);
    }
    this._updateStats();
  }

  /** Notifies listeners that metadata or effective options changed. */
  private _notifyUpdate(): void {
    for (const listener of this._listeners) {
      listener.onUpdate?.();
    }
  }

  /** Notifies listeners about asynchronous metadata errors. */
  private _notifyError(error: Error): void {
    for (const listener of this._listeners) {
      listener.onError?.(error);
    }
  }

  /** Recomputes absolute counter stats and notifies listeners. */
  private _updateStats(): void {
    const values = {
      'Tiles In Cache': this._cache.size,
      'Cache Size': this.cacheByteSize,
      'Visible Tiles': this.visibleTiles.length,
      'Selected Tiles': this._getSelectedTilesUnion().size,
      'Loading Tiles': this.loadingTiles.length,
      'Unloaded Tiles': this._unloadedTileCount,
      Consumers: this._consumers.size
    };
    let changed = false;
    for (const [name, value] of Object.entries(values)) {
      changed ||= !this.stats.stats[name] || this.stats.get(name).count !== value;
      this._setStatCount(name, value);
    }
    if (!changed) return;

    for (const listener of this._listeners) {
      listener.onStatsChange?.(this.stats);
    }
  }

  /** Writes an absolute count into a probe.gl stat. */
  private _setStatCount(name: string, value: number): void {
    this.stats.get(name).reset().addCount(value);
  }

  /** Returns the union of selected tiles across all consumers. */
  private _getSelectedTilesUnion(): Set<Tile2DHeader<DataT>> {
    const union = new Set<Tile2DHeader<DataT>>(this._selectedTiles || []);
    for (const consumer of this._consumers.values()) {
      for (const tile of consumer.selectedTiles) {
        union.add(tile);
      }
    }
    return union;
  }

  /** Returns the union of visible tiles across all consumers. */
  private _getVisibleTilesUnion(): Set<Tile2DHeader<DataT>> {
    const union = new Set<Tile2DHeader<DataT>>(this._tiles.filter(tile => tile.isVisible));
    for (const consumer of this._consumers.values()) {
      for (const tile of consumer.visibleTiles) {
        union.add(tile);
      }
    }
    return union;
  }

  /** Moves a touched tile to the back of the cache map for LRU eviction ordering. */
  private _touchTile(id: string, tile: Tile2DHeader<DataT>): void {
    this._cache.delete(id);
    this._cache.set(id, tile);
  }

  /** Computes the total byte size of all cached tile content. */
  private _getCacheByteSize(): number {
    let byteLength = 0;
    for (const tile of this._cache.values()) {
      byteLength += Number.isFinite((tile.content as any)?.byteLength)
        ? (tile.content as any).byteLength
        : 0;
    }
    return byteLength;
  }
}
