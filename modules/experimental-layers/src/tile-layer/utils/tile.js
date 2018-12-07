/* global console */
export default class Tile {
  constructor({getTileData, x, y, z}) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.isVisible = true;
    this.getTileData = getTileData;

    this._data = null;
    this._loader = null;
    this._loader = this._loadData();
  }

  get data() {
    if (this._data) {
      return Promise.resolve(this._data);
    }
    return this._loader;
  }

  get isLoaded() {
    return Boolean(this._data);
  }

  _loadData() {
    const {x, y, z} = this;
    if (!this.getTileData) {
      return null;
    }
    const getTileDataPromise = this.getTileData({x, y, z});
    getTileDataPromise
      .then(buffers => {
        this._data = buffers;
        return buffers;
      })
      .catch(err => {
        // eslint-disable-next-line
        console.warn(err);
      });
    return getTileDataPromise;
  }

  isOverlapped(tile) {
    const {x, y, z} = this;
    const m = Math.pow(2, tile.z - z);
    return Math.floor(tile.x / m) === x && Math.floor(tile.y / m) === y;
  }
}
