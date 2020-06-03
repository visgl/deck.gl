import {log} from '@deck.gl/core';
import RequestScheduler from '@loaders.gl/loader-utils';

const requestScheduler = new RequestScheduler({maxRequests: 1});

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

  async _loadData(getTileData) {
    const {x, y, z, bbox, layerId} = this;

    // Construct unique identifier for request scheduler handle
    const id = `${layerId}-${x}-${y}-${z}`;
    const requestToken = await requestScheduler.scheduleRequest(id, () => this.isVisible === true);

    let result;
    if (requestToken) {
      result = getTileData({x, y, z, bbox});
      requestToken.done();
    }
    return result;
  }

  loadData(getTileData) {
    if (!getTileData) {
      return;
    }

    this._loader = Promise.resolve(this._loadData(getTileData))
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
