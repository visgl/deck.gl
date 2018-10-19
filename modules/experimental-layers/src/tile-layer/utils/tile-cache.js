import Tile from './tile';
import {getTileIndices} from './viewport-util';

/**
 * Manages loading and purging of tiles data. This class caches recently visited tiles
 * and only create new tiles if they are present.
 */

export default class TileCache {
  /**
   * Takes in a function that returns tile data, a cache size, and a max and a min zoom level.
   * Cache size defaults to 5 * number of tiles in the current viewport
   */
  constructor({getTileData, maxSize, maxZoom, minZoom}) {
    // TODO: Instead of hardcode size, we should calculate how much memory left
    this.getTileData = getTileData;
    this.maxSize = maxSize;

    // Maps tile id in string {z}-{x}-{y} to a Tile object
    this.cache = new Map();

    this.maxZoom = maxZoom;
    this.minZoom = minZoom;
  }

  /**
   * Clear the current cache
   */
  finalize() {
    this.cache.clear();
  }

  /**
   * Update the cache with the given viewport and triggers callback onUpdate.
   * @param {*} viewport
   * @param {*} onUpdate
   */
  update(viewport, onUpdate) {
    const {cache, getTileData, maxSize} = this;
    cache.forEach(cachedTile => {
      cachedTile.isVisible = false;
    });
    const tileIndices = getTileIndices(viewport);
    const viewportTiles = new Set();
    cache.forEach(cachedTile => {
      if (tileIndices.some(tile => cachedTile.isOverlapped(tile))) {
        cachedTile.isVisible = true;
        viewportTiles.add(cachedTile);
      }
    });

    for (let i = 0; i < tileIndices.length; i++) {
      const x = Math.max(tileIndices[i].x, 0);
      const y = Math.max(tileIndices[i].y, 0);

      let z = tileIndices[i].z;
      if (this.maxZoom && z > this.maxZoom) {
        z = this.maxZoom;
      } else if (this.minZoom && z < this.minZoom) {
        z = this.minZoom;
      }
      let tile = this._getTile(x, y, z);
      if (!tile) {
        tile = new Tile({
          getTileData,
          x,
          y,
          z
        });
      }
      const tileId = this._getTileId(x, y, z);
      cache.set(tileId, tile);
      viewportTiles.add(tile);
    }
    // cache size is either the user defined maxSize or 5 * number of current tiles in the viewport.
    const commonZoomRange = 5;
    this._resizeCache(maxSize || commonZoomRange * tileIndices.length);
    // sort by zoom level so parents tiles don't show up when children tiles are rendered
    const viewportTilesArray = Array.from(viewportTiles).sort((t1, t2) => t1.z - t2.z);
    onUpdate(viewportTilesArray);
  }

  /**
   * Clear tiles that are not visible when the cache is full
   */
  _resizeCache(maxSize) {
    const {cache} = this;
    if (cache.size > maxSize) {
      for (const cachedTile of cache[Symbol.iterator]) {
        if (cache.size <= maxSize) {
          break;
        }
        const tileId = cachedTile[0];
        const tile = cachedTile[1];
        if (!tile.isVisible) {
          cache.delete(tileId);
        }
      }
    }
  }

  _getTile(x, y, z) {
    const tileId = this._getTileId(x, y, z);
    return this.cache.get(tileId);
  }

  _getTileId(x, y, z) {
    return `${z}-${x}-${y}`;
  }
}
