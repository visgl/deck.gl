export default class Tile {
  constructor({getTileData, x, y, z, onTileLoad, onTileError, tile2boundingBox}) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.bbox = tile2boundingBox(x, y, z);
    this.isVisible = true;
    this.getTileData = getTileData;
    this._data = null;
    this._isLoaded = false;
    this._loader = this._loadData();
    this.onTileLoad = onTileLoad;
    this.onTileError = onTileError;
  }

  get data() {
    return this._data || this._loader;
  }

  get isLoaded() {
    return this._isLoaded;
  }

  _loadData() {
    const {x, y, z, bbox} = this;
    if (!this.getTileData) {
      return null;
    }

    return Promise.resolve(this.getTileData({x, y, z, bbox}))
      .then(buffers => {
        this._data = buffers;
        this._isLoaded = true;
        this.onTileLoad(this);
        return buffers;
      })
      .catch(err => {
        this._isLoaded = true;
        this.onTileError(err);
      });
  }

  isOverlapped(tile) {
    const {x, y, z} = this;
    const m = Math.pow(2, tile.z - z);
    return Math.floor(tile.x / m) === x && Math.floor(tile.y / m) === y;
  }
}
