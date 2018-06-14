import Tile from './tile';

export default class TileCache {
  constructor({source, size = 10}) {
    this.source = source;
    this.size = size;

    this.cache = [];
  }

  getTile({x, y, z}) {
    let tile = this._find(x, y, z);
    if (!tile) {
      tile = new Tile({source: this.source, x, y, z});
      this._push(tile);
    }
    return tile;
  }

  _find(x, y, z) {
    return this.cache.find(t => t.x === x && t.y === y && t.z === z);
  }

  _push(tile) {
    const {cache, size} = this;
    cache.push(tile);

    if (cache.length > size) {
      let i = cache.findIndex(t => t.z !== tile.z);
      if (i < 0) {
        const d = (Math.sqrt(size) - 1) / 2;
        i = cache.findIndex(t => Math.abs(t.x - tile.x) > d || Math.abs(t.y - tile.y) > d);
      }
      cache.splice(i, 1);
    }
  }
}
