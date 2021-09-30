/* eslint-env browser */
import {log} from '@deck.gl/core';

export default class Tile2DHeader {
  constructor({x, y, z}) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.isVisible = false;
    this.isSelected = false;
    this.parent = null;
    this.children = [];

    this.content = null;

    this._loaderId = 0;
    this._isLoaded = false;
    this._isCancelled = false;
    this._needsReload = false;
  }

  get data() {
    return this.isLoading ? this._loader.then(() => this.data) : this.content;
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
      log.error('byteLength not defined in tile data')();
    }
    return result;
  }

  /* eslint-disable max-statements */
  async _loadData({getData, requestScheduler, onLoad, onError}) {
    const {x, y, z, bbox} = this;
    const loaderId = this._loaderId;

    this._abortController = new AbortController(); // eslint-disable-line no-undef
    const {signal} = this._abortController;

    const requestToken = await requestScheduler.scheduleRequest(this, tile => {
      return tile.isSelected ? 1 : -1;
    });

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
      tileData = await getData({x, y, z, bbox, signal});
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
    // error or cancellation
    this.content = tileData;
    // If cancelled, do not invoke the callbacks
    // Consider it loaded if we tried to cancel but `getTileData` still returned data
    if (this._isCancelled && !tileData) {
      this._isLoaded = false;
      return;
    }
    this._isLoaded = true;
    this._isCancelled = false;

    if (error) {
      onError(error, this);
    } else {
      onLoad(this);
    }
  }
  /* eslint-enable max-statements */

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
    this._abortController.abort();
  }
}
