import Tile from './tile';
import {getTileIndices} from './viewport-util';

/**
 * Manages loading and purging of tiles data
 */

export default class TileCache {
  // TODO: Instead of hardcode size, we should calculate how much memory left
  constructor({getTileData, size = 10}) {
    this.getTileData = getTileData;
    this.size = size;

    this.cache = [];
  }

  finalize() {
    this.cache = null;
  }

  update(viewport, onUpdate) {
    const {cache, size, getTileData} = this;
    const tiles = getTileIndices(viewport).map(({x, y, z}) => {
      let tile = this._find(x, y, z);
      if (!tile) {
        tile = new Tile({
          getTileData,
          x,
          y,
          z
        });
        this._push(tile);
      }
      return tile;
    });

    // TODO: implement logic that removes tiles outside the viewport
    // (or furthest from the view port)
    while (cache.length > size) {
      cache.shift();
    }

    // Sort by zoom level low - high
    cache.sort((t1, t2) => t1.z - t2.z);

    onUpdate(tiles);
  }

  _find(x, y, z) {
    return this.cache.find(t => t.x === x && t.y === y && t.z === z);
  }

  _push(tile) {
    this.cache.push(tile);
  }
}
