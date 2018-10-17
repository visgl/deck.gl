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
    return (
      this.getTileData &&
      this.getTileData({x, y, z}).then(buffers => {
        this._data = buffers;
        return buffers;
      })
    );
  }
}
