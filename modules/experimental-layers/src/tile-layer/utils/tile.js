export default class Tile {
  constructor({getTileData, x, y, z}) {
    this.x = x;
    this.y = y;
    this.z = z;

    this._data = null;
    this._loader = null;
    this.isVisible = false;

    this.getTileData = getTileData;

    this._loader = this._loadData();
  }

  get data() {
    if (this._data) {
      return Promise.resolve(this._data);
    }
    return this._loader;
  }

  get isLoaded() {
    return this._data !== null;
  }

  overlaps(tile) {
    const {x, y, z} = this;
    const m = Math.pow(2, tile.z - z);
    return Math.floor(tile.x / m) === x && Math.floor(tile.y / m) === y;
  }

  _loadData() {
    const {x, y, z} = this;
    if (!this.getTileData) {
      return null;
    }
    return this.getTileData({x, y, z})
      .then(buffers => {
        this._data = buffers;
        return buffers;
      })
      .catch(error => {
        // TODO: error handling: consider the case when we don't have tiles above MAX_ZOOM,
        // we should fallback to using data from an available zoom level.
        throw new Error(`Could not load tile data with tile ${z}-${x}-${y}: ${error}`);
      });
  }
}
