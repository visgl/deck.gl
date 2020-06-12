import {log} from '@deck.gl/core';
import {TILE_STATE_SELECTED} from './tileset-2d';

export default class Tile2DHeader {
  constructor({x, y, z, onTileLoad, onTileError, layerId}) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.isVisible = false;
    this.parent = null;
    this.children = [];
    this.layerId = layerId;

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

  async _loadData(getTileData, requestScheduler) {
    const {x, y, z, bbox} = this;

    const requestToken = await requestScheduler.scheduleRequest(this, tile => {
      return tile.state === TILE_STATE_SELECTED ? 1 : -1;
    });

    let result = null;
    if (requestToken) {
      try {
        result = await getTileData({x, y, z, bbox});
      } finally {
        requestToken.done();
      }
    }
    return result;
  }

  loadData(getTileData, requestScheduler) {
    if (!getTileData) {
      return;
    }

    this._loader = this._loadData(getTileData, requestScheduler)
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
