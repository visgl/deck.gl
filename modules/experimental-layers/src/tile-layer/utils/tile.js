export default class Tile {
  constructor({getTileData, x, y, z, onGetTileDataError}) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.isVisible = true;
    this.getTileData = getTileData;
    this._data = null;
    this._isLoaded = false;
    this._loader = this._loadData();
    this.onGetTileDataError = onGetTileDataError;
  }

  get data() {
    if (this._data) {
      return Promise.resolve(this._data);
    }
    return this._loader;
  }

  get isLoaded() {
    return this._isLoaded;
  }

  _loadData() {
    const {x, y, z} = this;
    if (!this.getTileData) {
      return null;
    }
    const getTileDataPromise = this.getTileData({x, y, z});
    return getTileDataPromise
      .then(buffers => {
        this._data = buffers;
        this._isLoaded = true;
        return buffers;
      })
      .catch(err => {
        this._isLoaded = true;
        this.onGetTileDataError(err);
      });
  }

  isOverlapped(tile) {
    const {x, y, z} = this;
    const m = Math.pow(2, tile.z - z);
    return Math.floor(tile.x / m) === x && Math.floor(tile.y / m) === y;
  }
}
