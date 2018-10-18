import Tile from './tile';
import {getTileIndices} from './viewport-util';

/**
 * Manages loading and purging of tiles data. This class caches recently visited tiles
 * and only create new tiles if they are present.
 */

export default class TileCache {
  /**
   * Takes in a function that returns tile data, and a cache size (default to 10).
   */
  constructor({getTileData, size = 10}) {
    // TODO: Instead of hardcode size, we should calculate how much memory left
    this.getTileData = getTileData;
    this.size = size;
    this.cache = [];
  }

  /**
   * Clear the current cache
   */
  finalize() {
    this.cache = null;
  }

  /**
   * Update the cache with the given viewport and triggers callback onUpdate.
   * @param {*} viewport
   * @param {*} onUpdate
   */
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

  /**
   * Return whether a tile with x, y, z exists in the cache.
   * @param {*} x
   * @param {*} y
   * @param {*} z
   */
  _find(x, y, z) {
    return this.cache.find(t => t.x === x && t.y === y && t.z === z);
  }

  /**
   * Add tile to cache
   * @param {*} tile
   */
  _push(tile) {
    this.cache.push(tile);
  }
}
