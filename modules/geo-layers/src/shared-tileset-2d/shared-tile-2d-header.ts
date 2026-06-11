// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-env browser */
import {RequestScheduler} from '@loaders.gl/loader-utils';

import type {TileBoundingBox, TileIndex, TileLoadProps} from '../tileset-2d/types';

/** Parameters used by {@link SharedTile2DHeader.loadData}. */
export type SharedTile2DLoadDataProps<DataT = any> = {
  /** Shared request scheduler for throttling tile fetches. */
  requestScheduler: RequestScheduler;
  /** Application-provided tile data loader. */
  getData: (props: TileLoadProps) => Promise<DataT | null> | DataT | null;
  /** Callback fired after tile content resolves successfully. */
  onLoad: (tile: SharedTile2DHeader<DataT>) => void;
  /** Callback fired after tile content fails to load. */
  onError: (error: any, tile: SharedTile2DHeader<DataT>) => void;
};

/** Shared tile cache entry used by {@link SharedTileset2D}. */
export class SharedTile2DHeader<DataT = any> {
  /** x/y/z tile coordinate. */
  index: TileIndex;
  /** Closest cached ancestor tile in the current tree. */
  parent: SharedTile2DHeader | null;
  /** Cached child tiles beneath this tile. */
  children: SharedTile2DHeader[] | null;
  /** Loaded tile payload. */
  content: DataT | null;

  /** Stable tile cache id. */
  id!: string;
  /** Resolved zoom level for the tile. */
  zoom!: number;
  /** Optional application data associated with the tile. */
  userData?: Record<string, any>;
  /** Bounds represented as `[[minX, minY], [maxX, maxY]]`. */
  boundingBox!: [min: number[], max: number[]];

  private _abortController: AbortController | null;
  private _loader: Promise<void> | undefined;
  private _loaderId: number;
  private _isLoaded: boolean;
  private _isCancelled: boolean;
  private _needsReload: boolean;
  private _bbox!: TileBoundingBox;

  /** Creates a tile header for a specific tile index. */
  constructor(index: TileIndex) {
    this.index = index;
    this.parent = null;
    this.children = [];
    this.content = null;

    this._loader = undefined;
    this._abortController = null;
    this._loaderId = 0;
    this._isLoaded = false;
    this._isCancelled = false;
    this._needsReload = false;
  }

  /** Structured bounds for the tile in the active coordinate system. */
  get bbox(): TileBoundingBox {
    return this._bbox;
  }

  /** Initializes the tile bounds once during tile creation. */
  set bbox(value: TileBoundingBox) {
    if (this._bbox) return;

    this._bbox = value;
    if ('west' in value) {
      this.boundingBox = [
        [value.west, value.south],
        [value.east, value.north]
      ];
    } else {
      this.boundingBox = [
        [value.left, value.top],
        [value.right, value.bottom]
      ];
    }
  }

  /** Resolves to loaded content while a request is in flight. */
  get data(): Promise<DataT | null> | DataT | null {
    const loader = this._loader;
    if (!this._isCancelled && loader !== undefined) {
      return loader.then(() => this.data);
    }
    return this.content;
  }

  /** Indicates whether tile content is available and up to date. */
  get isLoaded(): boolean {
    return this._isLoaded && !this._needsReload;
  }

  /** Indicates whether a tile request is currently in flight. */
  get isLoading(): boolean {
    return Boolean(this._loader) && !this._isCancelled;
  }

  /** Indicates whether the tile should be requested again. */
  get needsReload(): boolean {
    return this._needsReload || this._isCancelled;
  }

  /** Estimated byte size of the cached payload. */
  get byteLength(): number {
    const result = this.content ? (this.content as any).byteLength : 0;
    return Number.isFinite(result) ? result : 0;
  }

  private async _loadData({
    getData,
    requestScheduler,
    onLoad,
    onError
  }: SharedTile2DLoadDataProps<DataT>): Promise<void> {
    const completeLoad = (tileData: DataT | null, error: unknown, loaderId: number): void => {
      if (loaderId !== this._loaderId) {
        return;
      }

      this._loader = undefined;
      this.content = tileData;

      if (this._isCancelled && !tileData) {
        this._isLoaded = false;
        return;
      }

      this._isLoaded = true;
      this._isCancelled = false;

      if (error) {
        onError(error, this);
        return;
      }
      onLoad(this);
    };

    const {index, id, bbox, userData, zoom} = this;
    const loaderId = this._loaderId;

    this._abortController = new AbortController();
    const {signal} = this._abortController;
    const requestToken = await requestScheduler.scheduleRequest(this, () => 1);

    if (!requestToken) {
      this._isCancelled = true;
      return;
    }
    if (this._isCancelled) {
      requestToken.done();
      return;
    }

    let tileData: DataT | null = null;
    let error;
    try {
      tileData = await getData({index, id, bbox, userData, zoom, signal});
    } catch (err) {
      error = err || true;
    } finally {
      requestToken.done();
    }

    completeLoad(tileData, error, loaderId);
  }

  /** Loads tile data through the shared scheduler. */
  loadData(opts: SharedTile2DLoadDataProps<DataT>): Promise<void> {
    this._isLoaded = false;
    this._isCancelled = false;
    this._needsReload = false;
    this._loaderId++;
    this._loader = this._loadData(opts);
    return this._loader;
  }

  /** Marks the tile stale so it is refreshed on the next traversal. */
  setNeedsReload(): void {
    if (this.isLoading) {
      this.abort();
      this._loader = undefined;
    }
    this._needsReload = true;
  }

  /** Cancels an in-flight tile request. */
  abort(): void {
    if (this.isLoaded) {
      return;
    }
    this._isCancelled = true;
    this._abortController?.abort();
  }
}
