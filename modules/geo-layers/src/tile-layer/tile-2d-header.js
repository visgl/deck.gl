import {log} from '@deck.gl/core';

export default class Tile2DHeader {
  constructor({x, y, z, onTileLoad, onTileError}) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.isVisible = false;
    this.isSelected = false;
    this.parent = null;
    this.children = [];

    this.content = null;
    this._isLoaded = false;
    this._isCancelled = false;

    this.onTileLoad = onTileLoad;
    this.onTileError = onTileError;
  }

  get data() {
    return this._isLoaded ? this.content : this._loader;
  }

  get isLoaded() {
    return this._isLoaded;
  }

  get isCancelled() {
    return this._isCancelled;
  }

  get byteLength() {
    const result = this.content ? this.content.byteLength : 0;
    if (!Number.isFinite(result)) {
      log.error('byteLength not defined in tile data')();
    }
    return result;
  }

  /* eslint-disable max-statements */
  async _loadData(getTileData, requestScheduler) {
    const {x, y, z, bbox} = this;

    this._abortController = new AbortController(); // eslint-disable-line no-undef
    const {signal} = this._abortController;

    const requestToken = await requestScheduler.scheduleRequest(this, tile => {
      return tile.isSelected ? 1 : -1;
    });

    if (!requestToken) {
      console.log(`Cancelling tile x=${x}, y=${y}, z=${z}`);
      this._isCancelled = true;
      return;
    }

    this._isCancelled = false;
    let tileData;
    let error;
    try {
      console.log(`Requesting data for tile x=${x}, y=${y}, z=${z}`);
      tileData = await getTileData({x, y, z, bbox, signal});
    } catch (err) {
      error = err || true;
    } finally {
      requestToken.done();
      this._isLoaded = !this._isCancelled;
    }

    if (this._isCancelled) {
      console.log(`cancelled ${error}`);
      return;
    }

    if (error) {
      this.onTileError(error, this);
    } else {
      this.content = tileData;
      this.onTileLoad(this);
    }
  }
  /* eslint-enable max-statements */

  loadData(getTileData, requestScheduler) {
    if (!getTileData) {
      return;
    }

    this._loader = this._loadData(getTileData, requestScheduler);
  }

  abort() {
    if (this.isLoaded) {
      return;
    }

    this._abortController.abort();
    this._isCancelled = true;
  }
}
