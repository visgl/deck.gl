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
    this._getTileData = getTileData;
    this._maxSize = maxSize;

    // Maps tile id in string {z}-{x}-{y} to a Tile object
    this._cache = new Map();

    this._maxZoom = maxZoom;
    this._minZoom = minZoom;
  }

  /**
   * Clear the current cache
   */
  finalize() {
    this._cache.clear();
  }

  /**
   * Update the cache with the given viewport and triggers callback onUpdate.
   * @param {*} viewport
   * @param {*} onUpdate
   */
  update(viewport, onUpdate) {
    const {_cache, _getTileData, _maxSize} = this;
    _cache.forEach(cachedTile => {
      cachedTile.isVisible = false;
    });
    const tileIndices = getTileIndices(viewport);
    const viewportTiles = new Set();
    _cache.forEach(cachedTile => {
      if (tileIndices.some(tile => cachedTile.isOverlapped(tile))) {
        cachedTile.isVisible = true;
        viewportTiles.add(cachedTile);
      }
    });

    for (let i = 0; i < tileIndices.length; i++) {
      const x = Math.max(tileIndices[i].x, 0);
      const y = Math.max(tileIndices[i].y, 0);

      let z = tileIndices[i].z;
      if (this._maxZoom && z > this._maxZoom) {
        z = this._maxZoom;
      } else if (this._minZoom && z < this._minZoom) {
        z = this._minZoom;
      }
      let tile = this._getTile(x, y, z);
      if (!tile) {
        tile = new Tile({
          getTileData: _getTileData,
          x,
          y,
          z
        });
      }
      const tileId = this._getTileId(x, y, z);
      _cache.set(tileId, tile);
      viewportTiles.add(tile);
    }
    // cache size is either the user defined maxSize or 5 * number of current tiles in the viewport.
    const commonZoomRange = 5;
    this._resizeCache(_maxSize || commonZoomRange * tileIndices.length);
    // sort by zoom level so parents tiles don't show up when children tiles are rendered
    const viewportTilesArray = Array.from(viewportTiles).sort((t1, t2) => t1.z - t2.z);
    onUpdate(viewportTilesArray);
  }

  /**
   * Clear tiles that are not visible when the cache is full
   */
  _resizeCache(maxSize) {
    const {_cache} = this;
    if (_cache.size > maxSize) {
      const iterator = _cache[Symbol.iterator]();
      for (const cachedTile of iterator) {
        if (_cache.size <= maxSize) {
          break;
        }
        const tileId = cachedTile[0];
        const tile = cachedTile[1];
        if (!tile.isVisible) {
          _cache.delete(tileId);
        }
      }
    }
  }

  _getTile(x, y, z) {
    const tileId = this._getTileId(x, y, z);
    return this._cache.get(tileId);
  }

  _getTileId(x, y, z) {
    return `${z}-${x}-${y}`;
  }
}
