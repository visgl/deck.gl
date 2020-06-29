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

  async _loadData(getTileData, requestScheduler) {
    const {x, y, z, bbox} = this;

    const requestToken = await requestScheduler.scheduleRequest(this, tile => {
      return tile.isSelected ? 1 : -1;
    });

    if (!requestToken) {
      this._isCancelled = true;
      return;
    }

    this._isCancelled = false;
    let tileData;
    let error;
    try {
      tileData = await getTileData({x, y, z, bbox});
    } catch (err) {
      error = err || true;
    } finally {
      requestToken.done();
      this._isLoaded = true;
    }

    if (error) {
      this.onTileError(error, this);
    } else {
      this.content = tileData;
      this.onTileLoad(this);
    }
  }

  loadData(getTileData, requestScheduler) {
    if (!getTileData) {
      return;
    }

    this._loader = this._loadData(getTileData, requestScheduler);
  }
}
