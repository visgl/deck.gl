// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
export class Tile2DHeader {
    constructor(index) {
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
    /** @deprecated use `boundingBox` instead */
    get bbox() {
        return this._bbox;
    }
    // TODO - remove in v9
    set bbox(value) {
        // Only set once from `Tileset2D.getTileMetadata`
        if (this._bbox)
            return;
        this._bbox = value;
        if ('west' in value) {
            this.boundingBox = [
                [value.west, value.south],
                [value.east, value.north]
            ];
        }
        else {
            this.boundingBox = [
                [value.left, value.top],
                [value.right, value.bottom]
            ];
        }
    }
    get data() {
        return this.isLoading && this._loader ? this._loader.then(() => this.data) : this.content;
    }
    get isLoaded() {
        return this._isLoaded && !this._needsReload;
    }
    get isLoading() {
        return Boolean(this._loader) && !this._isCancelled;
    }
    get needsReload() {
        return this._needsReload || this._isCancelled;
    }
    get byteLength() {
        const result = this.content ? this.content.byteLength : 0;
        if (!Number.isFinite(result)) {
            // eslint-disable-next-line no-console
            console.error('byteLength not defined in tile data');
        }
        return result;
    }
    /* eslint-disable max-statements */
    async _loadData({ getData, getRequestPriority, requestScheduler, onLoad, onError }) {
        const { index, id, bbox, userData, zoom } = this;
        const loaderId = this._loaderId;
        this._abortController = new AbortController();
        const { signal } = this._abortController;
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
        let tileData = null;
        let error;
        try {
            tileData = await getData({ index, id, bbox, userData, zoom, signal });
        }
        catch (err) {
            error = err || true;
        }
        finally {
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
        }
        else {
            onLoad(this);
        }
    }
    loadData(opts) {
        this._isLoaded = false;
        this._isCancelled = false;
        this._needsReload = false;
        this._loaderId++;
        this._loader = this._loadData(opts);
        return this._loader;
    }
    setNeedsReload() {
        if (this.isLoading) {
            this.abort();
            this._loader = undefined;
        }
        this._needsReload = true;
    }
    abort() {
        if (this.isLoaded) {
            return;
        }
        this._isCancelled = true;
        this._abortController?.abort();
    }
}
//# sourceMappingURL=tile-2d-header.js.map