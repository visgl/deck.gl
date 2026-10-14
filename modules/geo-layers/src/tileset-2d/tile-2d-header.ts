// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-env browser */
import {RequestScheduler} from '@loaders.gl/loader-utils';
import {TileBoundingBox, TileIndex, TileLoadProps} from './types';
import type {Layer} from '@deck.gl/core';

/** Loader and scheduler callbacks for one tile request. */
export type TileLoadDataProps<DataT = any> = {
  /** Shared scheduler controlling concurrency and debounce. */
  requestScheduler: RequestScheduler;
  /** Retrieves content with tile metadata and an abort signal. */
  getData: (props: TileLoadProps) => Promise<DataT | null> | DataT | null;
  /** Calculates the current scheduling priority, with negative values cancelling unused requests. */
  getRequestPriority: (tile: Tile2DHeader<DataT>) => number;
  /** Receives a settled tile after successful loading. */
  onLoad: (tile: Tile2DHeader<DataT>) => void;
  /** Receives request failures for a settled tile. */
  onError: (error: any, tile: Tile2DHeader<DataT>) => void;
};

/** Cache entry holding tile metadata and content; legacy render flags belong to the default view. */
export class Tile2DHeader<DataT = any> {
  /** Coordinates of the tile in its source pyramid. */
  index: TileIndex;
  /** Compatibility default-view render flag; independent consumers store their own visibility. */
  isVisible: boolean;
  /** Compatibility default-view selection flag; independent consumers store their own selection. */
  isSelected: boolean;
  /** Closest retained ancestor in the tile tree. */
  parent: Tile2DHeader | null;
  /** Retained descendants linked to this cache entry. */
  children: Tile2DHeader[] | null;
  /** Loaded content shared by consumers. */
  content: DataT | null;
  /** Compatibility refinement bit flags. */
  state?: number;
  /** Compatibility TileLayer render cache; new layers retain render output in their own state. */
  layers?: Layer[] | null;

  /** Stable identifier assigned by the tileset. */
  id!: string; // assigned _always_ with result of `getTileId`
  /** Resolved source zoom assigned by the tileset. */
  zoom!: number; // assigned _always_ with result of `getTileZoom`
  /** Optional application metadata associated with this tile. */
  userData?: Record<string, any>; // _may be_ assigned with result of `getTileMetadata`
  /** Bounds in the form [[minX, minY], [maxX, maxY]]. */
  boundingBox!: [min: number[], max: number[]]; // assigned _always_ with bbox from `getTileMetadata`

  /** Abort controller for the current request. */
  private _abortController: AbortController | null;
  /** Promise representing an outstanding load. */
  private _loader: Promise<void> | undefined;
  /** Generation used to discard superseded responses. */
  private _loaderId: number;
  /** Whether the latest request has settled. */
  private _isLoaded: boolean;
  /** Whether the current request was cancelled. */
  private _isCancelled: boolean;
  /** Whether content should be fetched again. */
  private _needsReload: boolean;
  /** Structured tile bounds assigned at creation. */
  private _bbox!: TileBoundingBox;

  /** Creates an empty cache header for a source tile index. */
  constructor(index: TileIndex) {
    this.index = index;
    this.isVisible = false;
    this.isSelected = false;
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

  /** @deprecated Use boundingBox instead. */
  get bbox(): TileBoundingBox {
    return this._bbox;
  }

  // TODO - remove in v9
  /** Structured bounds represented by the requested tile. */
  set bbox(value: TileBoundingBox) {
    // Only set once from `Tileset2D.getTileMetadata`
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

  /** Content, or a promise resolving to content while loading. */
  get data(): Promise<DataT | null> | DataT | null {
    return this.isLoading && this._loader ? this._loader.then(() => this.data) : this.content;
  }

  /** Whether this tile's latest request has settled without a pending reload. */
  get isLoaded(): boolean {
    return this._isLoaded && !this._needsReload;
  }

  /** Whether a request is queued or in flight and has not been cancelled. */
  get isLoading(): boolean {
    return Boolean(this._loader) && !this._isCancelled;
  }

  /** Whether this tile's content was invalidated or its request cancelled. */
  get needsReload(): boolean {
    return this._needsReload || this._isCancelled;
  }

  /** Byte length reported by cached content. */
  get byteLength(): number {
    const result = this.content ? (this.content as any).byteLength : 0;
    if (!Number.isFinite(result)) {
      // eslint-disable-next-line no-console
      console.error('byteLength not defined in tile data');
    }
    return result;
  }

  /* eslint-disable max-statements */
  /** Schedules loading, discards stale responses, and reports completion. */
  private async _loadData({
    getData,
    getRequestPriority,
    requestScheduler,
    onLoad,
    onError
  }: TileLoadDataProps<DataT>): Promise<void> {
    const {index, id, bbox, userData, zoom} = this;
    const loaderId = this._loaderId;

    this._abortController = new AbortController();
    const {signal} = this._abortController;

    // @ts-expect-error (2345) loaders.gl's RequestScheduler callback type is too narrow.
    const requestToken = await requestScheduler.scheduleRequest(this, getRequestPriority);

    if (!requestToken) {
      this._isCancelled = true;
      return;
    }
    // A tile can be cancelled while being scheduled
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

    // If loadData has been called with a newer version, discard the result from this operation
    if (loaderId !== this._loaderId) {
      return;
    }
    // Clear the `isLoading` flag
    this._loader = undefined;
    // Rewrite tile content with the result of getTileData if successful, or `null` in case of
    // error or cancellation. A `null` tile is still a terminal result for the request: the tile
    // should stop blocking viewport loading even if the source returned 404 / empty content.
    this.content = tileData;
    // If cancelled, do not invoke the callbacks
    // Consider it loaded if we tried to cancel but `getTileData` still returned data
    if (this._isCancelled && !tileData) {
      this._isLoaded = false;
      return;
    }
    // Errors are reported via onError below, but the request itself has completed. Mark the tile
    // as loaded so higher-level layers can treat expected missing tiles as settled instead of
    // waiting forever for content or sublayers that will never exist.
    this._isLoaded = true;
    this._isCancelled = false;

    if (error) {
      onError(error, this);
    } else {
      onLoad(this);
    }
  }

  /** Starts a new request generation using the supplied scheduler. */
  loadData(opts: TileLoadDataProps): Promise<void> {
    this._isLoaded = false;
    this._isCancelled = false;
    this._needsReload = false;
    this._loaderId++;
    this._loader = this._loadData(opts);
    return this._loader;
  }

  /** Invalidates content and cancels any current request. */
  setNeedsReload(): void {
    if (this.isLoading) {
      this.abort();
      this._loader = undefined;
    }
    this._needsReload = true;
  }

  /** Cancels the current request without altering loaded content. */
  abort(): void {
    if (this.isLoaded) {
      return;
    }

    this._isCancelled = true;
    this._abortController?.abort();
  }
}
