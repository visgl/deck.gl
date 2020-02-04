export default class Tile2DHeader {
  constructor({getTileData, x, y, z, onTileLoad, onTileError, tileToBoundingBox}) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.bbox = tileToBoundingBox(this.x, this.y, this.z);
    this.selected = true;
    this.parent = null;
    this.children = [];

    this.content = null;
    this._isLoaded = false;
    this._loader = this._loadData(getTileData);

    this.onTileLoad = onTileLoad;
    this.onTileError = onTileError;
  }

  get data() {
    return this.content || this._loader;
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
