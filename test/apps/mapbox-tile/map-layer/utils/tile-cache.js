import Tile from './tile';
import {getTileIndices} from './viewport-utils';

/**
 * Manages loading and purging of tiles data
 */
export default class TileCache {
  constructor({source, size = 10, onUpdate}) {
    this.source = source;
    this.size = size;
    this.onUpdate = onUpdate;

    this.cache = [];
  }

  finalize() {
    this.cache = null;
    this.onUpdate = () => {};
  }

  update(viewport, callback) {
    const {cache, size} = this;
    this.onUpdate = callback;

    cache.forEach(tile => {
      tile.isVisible = false;
    });

    getTileIndices(viewport).forEach(({x, y, z}) => {
      let tile = this._find(x, y, z);
      if (!tile) {
        tile = new Tile({source: this.source, x, y, z});
        this._push(tile);
      }
      tile.isVisible = true;
    });

    while (cache.length > size) {
      const i = cache.findIndex(t => !t.isVisible);
      if (i < 0) {
        break;
      }
      cache.splice(i, 1);
    }

    // Sort by zoom level low - high
    cache.sort((t1, t2) => t1.z - t2.z);

    this.onUpdate(this.cache);
  }

  _find(x, y, z) {
    return this.cache.find(t => t.x === x && t.y === y && t.z === z);
  }

  _push(tile) {
    const {cache} = this;
    cache.push(tile);

    const altTiles = [];

    if (!tile.isLoaded) {
      // Waiting for tile to load, display loaded tiles that cover this area
      cache.forEach(t => {
        if (t !== tile &&
          t.isLoaded &&
          tile.overlaps(t) &&
          !altTiles.some(at => at.overlaps(t))) {
          altTiles.push(t);
        }
      });

      altTiles.forEach(t => (t.isVisible = true));
      tile.data.then(() => {
        if (tile.isVisible) {
          altTiles.forEach(t => (t.isVisible = false));
          this.onUpdate(this.cache);
        }
      });
    }
  }
}
