// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {RequestScheduler, type TileSource, type TileSourceMetadata} from '@loaders.gl/loader-utils';
import type {Matrix4} from '@math.gl/core';
import {Stats} from '@probe.gl/stats';

import {STRATEGY_DEFAULT, STRATEGY_NEVER, STRATEGY_REPLACE} from '../tileset-2d/tileset-2d';
import type {TileIndex, TileLoadProps, ZRange} from '../tileset-2d/types';
import type {SharedTileset2DAdapter, SharedTileset2DTileContext} from './adapter';
import {SharedTile2DHeader} from './shared-tile-2d-header';

export {STRATEGY_DEFAULT, STRATEGY_NEVER, STRATEGY_REPLACE};

/** Shared-safe placeholder refinement strategies. */
export type SharedRefinementStrategy =
  | typeof STRATEGY_NEVER
  | typeof STRATEGY_REPLACE
  | typeof STRATEGY_DEFAULT;

/** Core configuration shared by all {@link SharedTileset2D} instances. */
export type SharedTileset2DBaseProps<DataT = any, ViewStateT = unknown> = {
  /** Callback used to load tile payloads. */
  getTileData: (props: TileLoadProps) => Promise<DataT | null> | DataT | null;
  /** Adapter used to compute tile traversal and tile metadata. */
  adapter?: SharedTileset2DAdapter<ViewStateT> | null;
  /** Bounding box limiting tile generation. */
  extent?: number[] | null;
  /** Tile size in pixels. */
  tileSize?: number;
  /** Maximum zoom level to request. */
  maxZoom?: number | null;
  /** Minimum zoom level to request. */
  minZoom?: number | null;
  /** Maximum number of tiles kept in cache. */
  maxCacheSize?: number | null;
  /** Maximum bytes kept in cache. */
  maxCacheByteSize?: number | null;
  /** Placeholder refinement strategy. */
  refinementStrategy?: SharedRefinementStrategy;
  /** Elevation range used by geospatial tile selection. */
  zRange?: ZRange | null;
  /** Maximum concurrent tile requests. */
  maxRequests?: number;
  /** Debounce interval applied before issuing queued requests. */
  debounceTime?: number;
  /** Integer zoom offset applied when choosing tile levels. */
  zoomOffset?: number;
  /** The minimum zoom level at which tiles are visible. */
  visibleMinZoom?: number | null;
  /** The maximum zoom level at which tiles are visible. */
  visibleMaxZoom?: number | null;
  /** Callback fired when a tile loads successfully. */
  onTileLoad?: (tile: SharedTile2DHeader<DataT>) => void;
  /** Callback fired when a tile is evicted from cache. */
  onTileUnload?: (tile: SharedTile2DHeader<DataT>) => void;
  /** Callback fired when a tile request fails. */
  onTileError?: (err: any, tile: SharedTile2DHeader<DataT>) => void;
};

/** Options for creating a shared tile cache that can be reused by multiple layers and views. */
export type SharedTileset2DProps<DataT = any, ViewStateT = unknown> = Omit<
  SharedTileset2DBaseProps<DataT, ViewStateT>,
  'getTileData'
> & {
  /** Optional tile loader used when not sourcing data from a loaders.gl TileSource. */
  getTileData?: (props: TileLoadProps) => Promise<DataT | null> | DataT | null;
  /** Optional loaders.gl TileSource backing this shared tileset. */
  tileSource?: TileSource;
};

/** Subscription callbacks emitted by {@link SharedTileset2D}. */
export type SharedTileset2DListener<DataT = any> = {
  /** Fired after a tile loads successfully. */
  onTileLoad?: (tile: SharedTile2DHeader<DataT>) => void;
  /** Fired after a tile request fails. */
  onTileError?: (error: any, tile: SharedTile2DHeader<DataT>) => void;
  /** Fired after a tile is evicted from cache. */
  onTileUnload?: (tile: SharedTile2DHeader<DataT>) => void;
  /** Fired when metadata or effective configuration changes. */
  onUpdate?: () => void;
  /** Fired when asynchronous metadata initialization fails. */
  onError?: (error: Error) => void;
  /** Fired after live tileset counters are recomputed. */
  onStatsChange?: (stats: Stats) => void;
};

type ResolvedSharedTileset2DProps<DataT, ViewStateT> = Required<
  SharedTileset2DProps<DataT, ViewStateT>
>;

type ConsumerState<DataT = any> = {
  selectedTiles: Set<SharedTile2DHeader<DataT>>;
  visibleTiles: Set<SharedTile2DHeader<DataT>>;
};

const DEFAULT_SHARED_TILESET2D_PROPS: Omit<
  ResolvedSharedTileset2DProps<any, any>,
  'getTileData' | 'tileSource'
> = {
  adapter: null,
  extent: null,
  tileSize: 512,
  maxZoom: null,
  minZoom: null,
  maxCacheSize: 100,
  maxCacheByteSize: null,
  refinementStrategy: STRATEGY_DEFAULT,
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

/** Shared tile cache and loading engine for one or more shared tile layer instances. */
export class SharedTileset2D<DataT = any, ViewStateT = unknown> {
  /** Live counters describing shared tileset state. */
  readonly stats: Stats;
  /** Effective runtime options after defaults and metadata overrides have been applied. */
  protected opts: ResolvedSharedTileset2DProps<DataT, ViewStateT>;
  /** Cached metadata returned by the backing TileSource, if any. */
  protected sourceMetadata: TileSourceMetadata | null = null;

  private _requestScheduler: RequestScheduler;
  private _cache: Map<string, SharedTile2DHeader<DataT>>;
  private _dirty: boolean;
  private _tiles: SharedTile2DHeader<DataT>[];
  private _cacheByteSize: number;
  private _unloadedTileCount: number;
  private _listeners = new Set<SharedTileset2DListener<DataT>>();
  private _consumers = new Map<symbol, ConsumerState<DataT>>();
  private _explicitOptionKeys = new Set<string>();
  private _baseOpts: Partial<SharedTileset2DProps<DataT, ViewStateT>> = {};
  private _sourceMetadataOverrides: Partial<SharedTileset2DProps<DataT, ViewStateT>> = {};
  private _sourceMetadataGeneration = 0;
  private _maxZoom?: number;
  private _minZoom?: number;
  private _lastTileContext: SharedTileset2DTileContext<ViewStateT> | null = null;

  /** Creates a tileset from either `getTileData` or a loaders.gl `TileSource`. */
  constructor(opts: SharedTileset2DProps<DataT, ViewStateT>) {
    if (!opts.tileSource && !opts.getTileData) {
      throw new Error('SharedTileset2D requires either `getTileData` or `tileSource`.');
    }

    this.stats = new Stats({
      id: 'SharedTileset2D',
      stats: [
        {name: 'Tiles In Cache'},
        {name: 'Cache Size'},
        {name: 'Visible Tiles'},
        {name: 'Selected Tiles'},
        {name: 'Loading Tiles'},
        {name: 'Unloaded Tiles'},
        {name: 'Consumers'}
      ]
    });
    this.opts = this._resolveOptions();
    this._requestScheduler = this._createRequestScheduler();
    this._cache = new Map();
    this._tiles = [];
    this._dirty = false;
    this._cacheByteSize = 0;
    this._unloadedTileCount = 0;

    this.setOptions(opts);
    this._updateStats();
  }

  /** Convenience factory for wrapping a loaders.gl `TileSource`. */
  static fromTileSource<DataT = any, ViewStateT = unknown>(
    tileSource: TileSource,
    opts: Omit<SharedTileset2DProps<DataT, ViewStateT>, 'tileSource' | 'getTileData'> = {}
  ): SharedTileset2D<DataT, ViewStateT> {
    return new SharedTileset2D<DataT, ViewStateT>({...opts, tileSource});
  }

  /** All tiles currently present in the shared cache. */
  get tiles(): SharedTile2DHeader<DataT>[] {
    return this._tiles;
  }

  /** Estimated byte size of all tile content currently retained in cache. */
  get cacheByteSize(): number {
    return this._cacheByteSize;
  }

  /** Union of tiles selected by all attached consumers. */
  get selectedTiles(): SharedTile2DHeader<DataT>[] {
    return Array.from(this._getSelectedTilesUnion());
  }

  /** Union of tiles contributing to the visible result across all consumers and views. */
  get visibleTiles(): SharedTile2DHeader<DataT>[] {
    const union = this._getVisibleTilesUnion();
    for (const tile of this._getSelectedTilesUnion()) {
      union.add(tile);
    }
    return Array.from(union);
  }

  /** Tiles currently loading anywhere in the shared cache. */
  get loadingTiles(): SharedTile2DHeader<DataT>[] {
    return Array.from(this._cache.values()).filter(tile => tile.isLoading);
  }

  /** Maximum resolved zoom level after applying metadata and explicit options. */
  get maxZoom(): number | undefined {
    return this._maxZoom;
  }

  /** Minimum resolved zoom level after applying metadata and explicit options. */
  get minZoom(): number | undefined {
    return this._minZoom;
  }

  /** Pixel dimension used by the shared tile index and tile payloads. */
  get tileSize(): number {
    return this.opts.tileSize;
  }

  /** Active refinement strategy for placeholder handling. */
  get refinementStrategy(): SharedRefinementStrategy {
    return this.opts.refinementStrategy || STRATEGY_DEFAULT;
  }

  /** Adapter currently used for traversal and tile metadata. */
  get adapter(): SharedTileset2DAdapter<ViewStateT> | null {
    return this.opts.adapter;
  }

  /** Subscribes to tileset lifecycle events. */
  subscribe(listener: SharedTileset2DListener<DataT>): () => void {
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

  /** Updates tileset options and reapplies TileSource metadata overrides. */
  setOptions(
    opts: Partial<SharedTileset2DProps<DataT, ViewStateT>>,
    {replace = false}: {replace?: boolean} = {}
  ): void {
    const previousTileSource = this._baseOpts.tileSource;
    const previousMaxRequests = this.opts.maxRequests;
    const previousDebounceTime = this.opts.debounceTime;

    if (replace) {
      this._baseOpts = {};
      this._explicitOptionKeys.clear();
    }

    this._rememberExplicitOptions(opts);
    this._baseOpts = {...this._baseOpts, ...opts};

    const nextTileSource = this._baseOpts.tileSource;
    const tileSourceChanged = nextTileSource !== previousTileSource;
    if (tileSourceChanged) {
      this.sourceMetadata = null;
      this._sourceMetadataOverrides = {};
      this._sourceMetadataGeneration++;
    } else {
      this._sourceMetadataOverrides = this._getMetadataOverrides(this.sourceMetadata);
    }

    this.opts = this._resolveOptions();
    if (
      previousMaxRequests !== this.opts.maxRequests ||
      previousDebounceTime !== this.opts.debounceTime
    ) {
      this._requestScheduler = this._createRequestScheduler();
    }

    if (nextTileSource && tileSourceChanged) {
      const generation = this._sourceMetadataGeneration;
      this._initializeTileSource(nextTileSource, generation).catch(() => {});
    }
    if (tileSourceChanged && this._cache.size > 0) {
      this.reloadAll();
    }

    this._notifyUpdate();
  }

  /** Aborts in-flight requests and clears the shared cache. */
  finalize(): void {
    for (const tile of this._cache.values()) {
      if (tile.isLoading) {
        tile.abort();
      }
    }
    this._cache.clear();
    this._tiles = [];
    this._consumers.clear();
    this._cacheByteSize = 0;
    this._unloadedTileCount = 0;
    this._updateStats();
  }

  /** Marks all retained tiles stale and drops unused cached tiles. */
  reloadAll(): void {
    const selectedTiles = this._getSelectedTilesUnion();
    for (const [id, tile] of this._cache) {
      if (!selectedTiles.has(tile)) {
        this._cache.delete(id);
        this._handleTileUnload(tile);
      } else {
        tile.setNeedsReload();
      }
    }
    this._cacheByteSize = this._getCacheByteSize();
    this._dirty = true;
    this.prepareTiles();
    this._updateStats();
  }

  /** Recomputes retained bytes after a cached tile payload mutates in place. */
  notifyTileContentChanged(tile: SharedTile2DHeader<DataT>): void {
    if (this._cache.get(tile.id) !== tile) {
      return;
    }
    this._cacheByteSize = this._getCacheByteSize();
    this._resizeCache();
    this._notifyUpdate();
    this._updateStats();
  }

  /** Updates the selected and visible tile sets for one consumer. */
  updateConsumer(
    id: symbol,
    selectedTiles: SharedTile2DHeader<DataT>[],
    visibleTiles: SharedTile2DHeader<DataT>[]
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

  /** Returns tile indices needed to cover a viewport. */
  getTileIndices({
    viewState,
    maxZoom,
    minZoom,
    zRange,
    modelMatrix,
    modelMatrixInverse
  }: {
    viewState: ViewStateT;
    maxZoom?: number;
    minZoom?: number;
    zRange: ZRange | null;
    modelMatrix?: Matrix4 | null;
    modelMatrixInverse?: Matrix4 | null;
  }): TileIndex[] {
    const {adapter, tileSize, extent, zoomOffset, visibleMinZoom, visibleMaxZoom} = this.opts;
    if (!adapter) {
      throw new Error('SharedTileset2D requires an adapter before tile traversal can be used.');
    }
    this._lastTileContext = {viewState, tileSize};
    return adapter.getTileIndices({
      viewState,
      maxZoom,
      minZoom,
      zRange,
      tileSize,
      extent: normalizeBounds(extent),
      modelMatrix,
      modelMatrixInverse,
      zoomOffset,
      visibleMinZoom,
      visibleMaxZoom
    });
  }

  /** Returns the stable cache id for a tile index. */
  getTileId(index: TileIndex): string {
    return `${index.x}-${index.y}-${index.z}`;
  }

  /** Returns the zoom level represented by a tile index. */
  getTileZoom(index: TileIndex): number {
    return index.z;
  }

  /** Returns derived metadata used to initialize a tile header. */
  getTileMetadata(index: TileIndex): Record<string, any> {
    if (!this._lastTileContext) {
      throw new Error('SharedTileset2D metadata requested before traversal context was set.');
    }
    if (!this.opts.adapter) {
      throw new Error('SharedTileset2D requires an adapter before tile metadata can be derived.');
    }
    return {bbox: this.opts.adapter.getTileBoundingBox(this._lastTileContext, index)};
  }

  /** Returns the parent tile index in the quadtree. */
  getParentIndex(index: TileIndex): TileIndex {
    return {x: Math.floor(index.x / 2), y: Math.floor(index.y / 2), z: index.z - 1};
  }

  /** Returns a cached tile and optionally creates and loads it on demand. */
  getTile(index: TileIndex, create: true): SharedTile2DHeader<DataT>;
  getTile(index: TileIndex, create?: false): SharedTile2DHeader<DataT> | undefined;
  getTile(index: TileIndex, create?: boolean): SharedTile2DHeader<DataT> | undefined {
    const id = this.getTileId(index);
    let tile = this._cache.get(id);
    let needsReload = false;

    if (!tile && create) {
      tile = new SharedTile2DHeader(index);
      Object.assign(tile, this.getTileMetadata(tile.index));
      Object.assign(tile, {id, zoom: this.getTileZoom(tile.index)});
      needsReload = true;
      this._cache.set(id, tile);
      this._dirty = true;
      this._updateStats();
    } else if (tile && tile.needsReload) {
      needsReload = true;
    }

    if (tile) {
      this._touchTile(id, tile);
    }

    if (tile && needsReload) {
      tile
        .loadData({
          getData: this.opts.getTileData,
          requestScheduler: this._requestScheduler,
          onLoad: this._handleTileLoad.bind(this),
          onError: this._handleTileError.bind(this)
        })
        .catch(() => {});
      this._updateStats();
    }

    return tile;
  }

  private _createRequestScheduler(): RequestScheduler {
    return new RequestScheduler({
      throttleRequests: this.opts.maxRequests > 0 || this.opts.debounceTime > 0,
      maxRequests: this.opts.maxRequests,
      debounceTime: this.opts.debounceTime
    });
  }

  private async _initializeTileSource(tileSource: TileSource, generation: number): Promise<void> {
    try {
      const sourceMetadata = await tileSource.getMetadata();
      if (
        generation !== this._sourceMetadataGeneration ||
        tileSource !== this._baseOpts.tileSource
      ) {
        return;
      }
      this.sourceMetadata = sourceMetadata;
      this._sourceMetadataOverrides = this._getMetadataOverrides(sourceMetadata);
      this.opts = this._resolveOptions();
      this._notifyUpdate();
    } catch (error: any) {
      if (
        generation !== this._sourceMetadataGeneration ||
        tileSource !== this._baseOpts.tileSource
      ) {
        return;
      }
      const normalizedError =
        error instanceof Error ? error : new Error(`TileSource metadata error: ${String(error)}`);
      this._notifyError(normalizedError);
    }
  }

  private _rememberExplicitOptions(opts: Partial<SharedTileset2DProps<DataT, ViewStateT>>): void {
    for (const key of Object.keys(opts)) {
      this._explicitOptionKeys.add(key);
    }
  }

  private _resolveOptions(): ResolvedSharedTileset2DProps<DataT, ViewStateT> {
    const resolvedOpts = {
      ...DEFAULT_SHARED_TILESET2D_PROPS,
      getTileData: () => null,
      tileSource: undefined,
      ...this._sourceMetadataOverrides,
      ...this._baseOpts
    } as ResolvedSharedTileset2DProps<DataT, ViewStateT>;

    if (resolvedOpts.tileSource) {
      const tileSource = resolvedOpts.tileSource;
      resolvedOpts.getTileData = (loadProps: TileLoadProps) =>
        tileSource.getTileData(loadProps) as Promise<DataT | null> | DataT | null;
    }

    this._maxZoom =
      typeof resolvedOpts.maxZoom === 'number' && Number.isFinite(resolvedOpts.maxZoom)
        ? Math.floor(resolvedOpts.maxZoom)
        : undefined;
    this._minZoom =
      typeof resolvedOpts.minZoom === 'number' && Number.isFinite(resolvedOpts.minZoom)
        ? Math.ceil(resolvedOpts.minZoom)
        : undefined;

    return resolvedOpts;
  }

  private _getMetadataOverrides(
    metadata: TileSourceMetadata | null
  ): Partial<SharedTileset2DProps<DataT, ViewStateT>> {
    if (!metadata) {
      return {};
    }
    const overrides: Partial<SharedTileset2DProps<DataT, ViewStateT>> = {};
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

  private _handleTileLoad(tile: SharedTile2DHeader<DataT>): void {
    this.opts.onTileLoad?.(tile);
    this._cacheByteSize = this._getCacheByteSize();
    this._resizeCache();
    for (const listener of this._listeners) {
      listener.onTileLoad?.(tile);
    }
    this._updateStats();
  }

  private _handleTileError(error: any, tile: SharedTile2DHeader<DataT>): void {
    this.opts.onTileError?.(error, tile);
    for (const listener of this._listeners) {
      listener.onTileError?.(error, tile);
    }
    this._updateStats();
  }

  private _handleTileUnload(tile: SharedTile2DHeader<DataT>): void {
    this._unloadedTileCount++;
    this.opts.onTileUnload?.(tile);
    for (const listener of this._listeners) {
      listener.onTileUnload?.(tile);
    }
    this._updateStats();
  }

  private _notifyUpdate(): void {
    for (const listener of this._listeners) {
      listener.onUpdate?.();
    }
  }

  private _notifyError(error: Error): void {
    for (const listener of this._listeners) {
      listener.onError?.(error);
    }
  }

  private _updateStats(): void {
    this._setStatCount('Tiles In Cache', this._cache.size);
    this._setStatCount('Cache Size', this.cacheByteSize);
    this._setStatCount('Visible Tiles', this.visibleTiles.length);
    this._setStatCount('Selected Tiles', this.selectedTiles.length);
    this._setStatCount('Loading Tiles', this.loadingTiles.length);
    this._setStatCount('Unloaded Tiles', this._unloadedTileCount);
    this._setStatCount('Consumers', this._consumers.size);

    for (const listener of this._listeners) {
      listener.onStatsChange?.(this.stats);
    }
  }

  private _setStatCount(name: string, value: number): void {
    this.stats.get(name).reset().addCount(value);
  }

  private _getSelectedTilesUnion(): Set<SharedTile2DHeader<DataT>> {
    const union = new Set<SharedTile2DHeader<DataT>>();
    for (const consumer of this._consumers.values()) {
      for (const tile of consumer.selectedTiles) {
        union.add(tile);
      }
    }
    return union;
  }

  private _getVisibleTilesUnion(): Set<SharedTile2DHeader<DataT>> {
    const union = new Set<SharedTile2DHeader<DataT>>();
    for (const consumer of this._consumers.values()) {
      for (const tile of consumer.visibleTiles) {
        union.add(tile);
      }
    }
    return union;
  }

  private _touchTile(id: string, tile: SharedTile2DHeader<DataT>): void {
    this._cache.delete(id);
    this._cache.set(id, tile);
  }

  private _getCacheByteSize(): number {
    let byteLength = 0;
    for (const tile of this._cache.values()) {
      byteLength += tile.byteLength;
    }
    return byteLength;
  }

  private _pruneRequests(): void {
    const {maxRequests = 0} = this.opts;
    const selectedTiles = this._getSelectedTilesUnion();
    const visibleTiles = this._getVisibleTilesUnion();
    const abortCandidates: SharedTile2DHeader<DataT>[] = [];
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

  private _rebuildTree(): void {
    for (const tile of this._cache.values()) {
      tile.parent = null;
      if (tile.children) {
        tile.children.length = 0;
      }
    }
    for (const tile of this._cache.values()) {
      const parent = this._getNearestAncestor(tile);
      tile.parent = parent;
      if (parent?.children) {
        parent.children.push(tile);
      }
    }
  }

  private _syncTiles(): void {
    this._tiles = Array.from(this._cache.values()).sort((t1, t2) => t1.zoom - t2.zoom);
  }

  private _resizeCache(): void {
    const maxCacheSize = this.opts.maxCacheSize ?? 100;
    const maxCacheByteSize = this.opts.maxCacheByteSize ?? Infinity;
    const visibleTiles = this._getVisibleTilesUnion();
    const selectedTiles = this._getSelectedTilesUnion();
    const overflown = this._cache.size > maxCacheSize || this._cacheByteSize > maxCacheByteSize;

    if (overflown) {
      for (const [id, tile] of this._cache) {
        if (!visibleTiles.has(tile) && !selectedTiles.has(tile)) {
          this._cache.delete(id);
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

  private _getNearestAncestor(tile: SharedTile2DHeader<DataT>): SharedTile2DHeader<DataT> | null {
    const {_minZoom = 0} = this;
    let index = tile.index;
    while (this.getTileZoom(index) > _minZoom) {
      index = this.getParentIndex(index);
      const parent = this._cache.get(this.getTileId(index));
      if (parent) {
        return parent;
      }
    }
    return null;
  }
}

function normalizeBounds(extent: number[] | null | undefined) {
  return extent && extent.length === 4 ? (extent as [number, number, number, number]) : undefined;
}
