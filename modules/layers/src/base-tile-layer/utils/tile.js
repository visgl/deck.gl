export default class Tile {
  constructor({getTileData, x, y, z, onTileLoad, onTileError, tileToBoundingBox}) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.bbox = tileToBoundingBox(this.x, this.y, this.z);
    this.isVisible = true;
    this.parent = null;
    this.children = [];

    this._data = null;
    this._isLoaded = false;
    this._loader = this._loadData(getTileData);

    this.onTileLoad = onTileLoad;
    this.onTileError = onTileError;
  }

  get data() {
    return this._data || this._loader;
  }

  get isLoaded() {
    return this._isLoaded;
  }

  _loadData(getTileData) {
    const {x, y, z, bbox} = this;
    if (!getTileData) {
      return null;
    }

    return Promise.resolve(getTileData({x, y, z, bbox}))
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
}
