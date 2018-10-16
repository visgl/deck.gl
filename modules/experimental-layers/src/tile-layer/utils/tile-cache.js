import Tile from './tile';
import {getTileIndices} from './viewport-util';

/**
 * Manages loading and purging of tiles data
 */

export default class TileCache {
  constructor({fetchData, size = 10, onUpdate}) {
    this.fetchData = fetchData;
    this.size = size;
    this.onUpdate = onUpdate;

    this.cache = [];
  }

  finalize() {
    this.cache = null;
    this.onUpdate = () => {};
  }

  update(viewport, callback) {
    const {cache, size, fetchData} = this;
    this.onUpdate = callback;
    const tiles = getTileIndices(viewport).map(({x, y, z}) => {
      let tile = this._find(x, y, z);
      if (!tile) {
        tile = new Tile({
          fetchData,
          x,
          y,
          z
        });
        this._push(tile);
      }
      return tile;
    });

    while (cache.length > size) {
      cache.shift();
    }

    // Sort by zoom level low - high
    cache.sort((t1, t2) => t1.z - t2.z);

    this.onUpdate(tiles);
  }

  _find(x, y, z) {
    return this.cache.find(t => t.x === x && t.y === y && t.z === z);
  }

  _push(tile) {
    this.cache.push(tile);
  }
}
