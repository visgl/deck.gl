import {log} from '@deck.gl/core';

export default class Tile2DHeader {
  constructor({x, y, z, onTileLoad, onTileError}) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.isVisible = false;
    this.parent = null;
    this.children = [];

    this.content = null;
    this._isLoaded = false;

    this.onTileLoad = onTileLoad;
    this.onTileError = onTileError;
  }

  get data() {
    return this._isLoaded ? this.content : this._loader;
  }

  get isLoaded() {
    return this._isLoaded;
  }

  get byteLength() {
    const result = this.content ? this.content.byteLength : 0;
    if (!Number.isFinite(result)) {
      log.error('byteLength not defined in tile data')();
    }
    return result;
  }

  loadData(getTileData) {
    const {x, y, z, bbox} = this;
    if (!getTileData) {
      return;
    }

    this._loader = Promise.resolve(getTileData({x, y, z, bbox}))
      .then(buffers => {
        this.content = buffers;
        this._isLoaded = true;
        this.onTileLoad(this);
        return buffers;
      })
      .catch(err => {
        this._isLoaded = true;
        this.onTileError(err);
      });
  }
}
