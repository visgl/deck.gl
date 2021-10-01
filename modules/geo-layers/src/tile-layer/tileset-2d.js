import Tile2DHeader from './tile-2d-header';
import {getTileIndices, tileToBoundingBox} from './utils';
import {RequestScheduler} from '@loaders.gl/loader-utils';
import {Matrix4} from 'math.gl';

const TILE_STATE_UNKNOWN = 0;
const TILE_STATE_VISIBLE = 1;
/*
   show cached parent tile if children are loading
   +-----------+       +-----+            +-----+-----+
   |           |       |     |            |     |     |
   |           |       |     |            |     |     |
   |           |  -->  +-----+-----+  ->  +-----+-----+
   |           |             |     |      |     |     |
   |           |             |     |      |     |     |
   +-----------+             +-----+      +-----+-----+

   show cached children tiles when parent is loading
   +-------+----       +------------
   |       |           |
   |       |           |
   |       |           |
   +-------+----  -->  |
   |       |           |
 */
const TILE_STATE_PLACEHOLDER = 3;
const TILE_STATE_HIDDEN = 4;
// tiles that should be displayed in the current viewport
const TILE_STATE_SELECTED = 5;

export const STRATEGY_NEVER = 'never';
export const STRATEGY_REPLACE = 'no-overlap';
export const STRATEGY_DEFAULT = 'best-available';

const DEFAULT_CACHE_SCALE = 5;

/**
 * Manages loading and purging of tiles data. This class caches recently visited tiles
 * and only create new tiles if they are present.
 */

export default class Tileset2D {
  /**
   * Takes in a function that returns tile data, a cache size, and a max and a min zoom level.
   * Cache size defaults to 5 * number of tiles in the current viewport
   */
  constructor(opts) {
    this.opts = opts;

    this.onTileLoad = tile => {
      this.opts.onTileLoad(tile);
      if (this.opts.maxCacheByteSize) {
        this._cacheByteSize += tile.byteLength;
        this._resizeCache();
      }
    };

    this._requestScheduler = new RequestScheduler({
      maxRequests: opts.maxRequests,
      throttleRequests: opts.maxRequests > 0
    });

    // Maps tile id in string {z}-{x}-{y} to a Tile object
    this._cache = new Map();
    this._tiles = [];
    this._dirty = false;
    this._cacheByteSize = 0;

    // Cache the last processed viewport
    this._viewport = null;
    this._selectedTiles = null;
    this._frameNumber = 0;

    this.setOptions(opts);
  }

  /* Public API */
  get tiles() {
    return this._tiles;
  }

  get selectedTiles() {
    return this._selectedTiles;
  }

  get isLoaded() {
    return this._selectedTiles.every(tile => tile.isLoaded);
  }

  setOptions(opts) {
    Object.assign(this.opts, opts);
    if (Number.isFinite(opts.maxZoom)) {
      this._maxZoom = Math.floor(opts.maxZoom);
    }
    if (Number.isFinite(opts.minZoom)) {
      this._minZoom = Math.ceil(opts.minZoom);
    }
  }

  // Clean up any outstanding tile requests.
  finalize() {
    for (const tile of this._cache.values()) {
      if (tile.isLoading) {
        tile.abort();
      }
    }
    this._cache.clear();
    this._tiles = [];
    this._selectedTiles = null;
  }

  reloadAll() {
    for (const tileId of this._cache.keys()) {
      const tile = this._cache.get(tileId);
      if (!this._selectedTiles.includes(tile)) {
        this._cache.delete(tileId);
      } else {
        tile.setNeedsReload();
      }
    }
  }

  /**
   * Update the cache with the given viewport and model matrix and triggers callback onUpdate.
   * @param {*} viewport
   * @param {*} onUpdate
   * @param {*} modelMatrix
   */
  update(viewport, {zRange, modelMatrix} = {}) {
    const modelMatrixAsMatrix4 = new Matrix4(modelMatrix);
    const isModelMatrixNew = !modelMatrixAsMatrix4.equals(this._modelMatrix);
    if (!viewport.equals(this._viewport) || isModelMatrixNew) {
      if (isModelMatrixNew) {
        this._modelMatrixInverse = modelMatrix && modelMatrixAsMatrix4.clone().invert();
        this._modelMatrix = modelMatrix && modelMatrixAsMatrix4;
      }
      this._viewport = viewport;
      const tileIndices = this.getTileIndices({
        viewport,
        maxZoom: this._maxZoom,
        minZoom: this._minZoom,
        zRange,
        modelMatrix: this._modelMatrix,
        modelMatrixInverse: this._modelMatrixInverse
      });
      this._selectedTiles = tileIndices.map(index => this._getTile(index, true));

      if (this._dirty) {
        // Some new tiles are added
        this._rebuildTree();
      }
    }

    // Update tile states
    const changed = this.updateTileStates();

    if (this._dirty) {
      // cache size is either the user defined maxSize or 5 * number of current tiles in the viewport.
      this._resizeCache();
    }

    if (changed) {
      this._frameNumber++;
    }

    return this._frameNumber;
  }

  /* Public interface for subclassing */

  // Returns array of {x, y, z}
  getTileIndices({viewport, maxZoom, minZoom, zRange, modelMatrix, modelMatrixInverse}) {
    const {tileSize, extent, zoomOffset} = this.opts;
    return getTileIndices({
      viewport,
      maxZoom,
      minZoom,
      zRange,
      tileSize,
      extent,
      modelMatrix,
      modelMatrixInverse,
      zoomOffset
    });
  }

  // Add custom metadata to tiles
  getTileMetadata({x, y, z}) {
    const {tileSize} = this.opts;
    return {bbox: tileToBoundingBox(this._viewport, x, y, z, tileSize)};
  }

  // Returns {x, y, z} of the parent tile
  getParentIndex(tileIndex) {
    // Perf: mutate the input object to avoid GC
    tileIndex.x = Math.floor(tileIndex.x / 2);
    tileIndex.y = Math.floor(tileIndex.y / 2);
    tileIndex.z -= 1;
    return tileIndex;
  }

  // Returns true if any tile's visibility changed
  updateTileStates() {
    this._updateTileStates(this.selectedTiles);

    const {maxRequests} = this.opts;

    const abortCandidates = [];
    let ongoingRequestCount = 0;
    let changed = false;
    for (const tile of this._cache.values()) {
      const isVisible = Boolean(tile.state & TILE_STATE_VISIBLE);
      if (tile.isVisible !== isVisible) {
        changed = true;
        tile.isVisible = isVisible;
      }

      // isSelected used in request scheduler
      tile.isSelected = tile.state === TILE_STATE_SELECTED;

      // Keep track of all the ongoing requests
      if (tile.isLoading) {
        ongoingRequestCount++;
        if (!tile.isSelected) {
          abortCandidates.push(tile);
        }
      }
    }

    if (maxRequests > 0) {
      while (ongoingRequestCount > maxRequests && abortCandidates.length > 0) {
        // There are too many ongoing requests, so abort some that are unselected
        const tile = abortCandidates.shift();
        tile.abort();
        ongoingRequestCount--;
      }
    }

    return changed;
  }

  /* Private methods */

  // This needs to be called every time some tiles have been added/removed from cache
  _rebuildTree() {
    const {_cache} = this;

    // Reset states
    for (const tile of _cache.values()) {
      tile.parent = null;
      tile.children.length = 0;
    }

    // Rebuild tree
    for (const tile of _cache.values()) {
      const parent = this._getNearestAncestor(tile.x, tile.y, tile.z);
      tile.parent = parent;
      if (parent) {
        parent.children.push(tile);
      }
    }
  }

  // A selected tile is always visible.
  // Never show two overlapping tiles.
  // If a selected tile is loading, try showing a cached ancester with the closest z
  // If a selected tile is loading, and no ancester is shown - try showing cached
  // descendants with the closest z
  _updateTileStates(selectedTiles) {
    const {_cache} = this;
    const refinementStrategy = this.opts.refinementStrategy || STRATEGY_DEFAULT;

    // Reset states
    for (const tile of _cache.values()) {
      tile.state = TILE_STATE_UNKNOWN;
    }

    // For all the selected && pending tiles:
    // - pick the closest ancestor as placeholder
    // - if no ancestor is visible, pick the closest children as placeholder
    for (const tile of selectedTiles) {
      tile.state = TILE_STATE_SELECTED;
    }

    if (refinementStrategy === STRATEGY_NEVER) {
      return;
    }
    for (const tile of selectedTiles) {
      getPlaceholderInAncestors(tile, refinementStrategy);
    }
    for (const tile of selectedTiles) {
      if (needsPlaceholder(tile)) {
        getPlaceholderInChildren(tile);
      }
    }
  }

  /**
   * Clear tiles that are not visible when the cache is full
   */
  /* eslint-disable complexity */
  _resizeCache() {
    const {_cache, opts} = this;

    const maxCacheSize =
      opts.maxCacheSize ||
      (opts.maxCacheByteSize ? Infinity : DEFAULT_CACHE_SCALE * this.selectedTiles.length);
    const maxCacheByteSize = opts.maxCacheByteSize || Infinity;

    const overflown = _cache.size > maxCacheSize || this._cacheByteSize > maxCacheByteSize;

    if (overflown) {
      for (const [tileId, tile] of _cache) {
        if (!tile.isVisible) {
          // delete tile
          this._cacheByteSize -= opts.maxCacheByteSize ? tile.byteLength : 0;
          _cache.delete(tileId);
          this.opts.onTileUnload(tile);
        }
        if (_cache.size <= maxCacheSize && this._cacheByteSize <= maxCacheByteSize) {
          break;
        }
      }
      this._rebuildTree();
      this._dirty = true;
    }
    if (this._dirty) {
      this._tiles = Array.from(this._cache.values())
        // sort by zoom level so that smaller tiles are displayed on top
        .sort((t1, t2) => t1.z - t2.z);

      this._dirty = false;
    }
  }
  /* eslint-enable complexity */

  _getTile({x, y, z}, create) {
    const tileId = `${x},${y},${z}`;
    let tile = this._cache.get(tileId);
    let needsReload = false;

    if (!tile && create) {
      tile = new Tile2DHeader({x, y, z});
      Object.assign(tile, this.getTileMetadata(tile));
      needsReload = true;
      this._cache.set(tileId, tile);
      this._dirty = true;
    } else if (tile && tile.needsReload) {
      needsReload = true;
    }
    if (needsReload) {
      tile.loadData({
        getData: this.opts.getTileData,
        requestScheduler: this._requestScheduler,
        onLoad: this.onTileLoad,
        onError: this.opts.onTileError
      });
    }

    return tile;
  }

  _getNearestAncestor(x, y, z) {
    const {_minZoom = 0} = this;
    let index = {x, y, z};

    while (index.z > _minZoom) {
      index = this.getParentIndex(index);
      const parent = this._getTile(index);
      if (parent) {
        return parent;
      }
    }
    return null;
  }
}

// A selected tile needs placeholder from its children if
// - it is not loaded
// - none of its ancestors is visible and loaded
function needsPlaceholder(tile) {
  let t = tile;
  while (t) {
    if (t.state & (TILE_STATE_VISIBLE === 0)) {
      return true;
    }
    if (t.isLoaded) {
      return false;
    }
    t = t.parent;
  }
  return true;
}

function getPlaceholderInAncestors(tile, refinementStrategy) {
  let parent;
  let state = TILE_STATE_PLACEHOLDER;
  while ((parent = tile.parent)) {
    if (tile.isLoaded) {
      // If a tile is loaded, mark all its ancestors as hidden
      state = TILE_STATE_HIDDEN;
      if (refinementStrategy === STRATEGY_DEFAULT) {
        return;
      }
    }
    parent.state = Math.max(parent.state, state);
    tile = parent;
  }
}

// Recursively set children as placeholder
function getPlaceholderInChildren(tile) {
  for (const child of tile.children) {
    child.state = Math.max(child.state, TILE_STATE_PLACEHOLDER);
    if (!child.isLoaded) {
      getPlaceholderInChildren(child);
    }
  }
}
