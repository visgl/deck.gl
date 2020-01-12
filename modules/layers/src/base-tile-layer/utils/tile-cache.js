import Tile from './tile';

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

export const STRATEGY_EXCLUSIVE = 'exclusive';
export const STRATEGY_DEFAULT = 'default';

/**
 * Manages loading and purging of tiles data. This class caches recently visited tiles
 * and only create new tiles if they are present.
 */

export default class TileCache {
  /**
   * Takes in a function that returns tile data, a cache size, and a max and a min zoom level.
   * Cache size defaults to 5 * number of tiles in the current viewport
   */
  constructor({
    getTileData,
    maxSize,
    maxZoom,
    minZoom,
    strategy = STRATEGY_DEFAULT,
    onTileLoad,
    onTileError,
    getTileIndices,
    tileToBoundingBox
  }) {
    // TODO: Instead of hardcode size, we should calculate how much memory left
    this._getTileData = getTileData;
    this._maxSize = maxSize;
    this._strategy = strategy;
    this._getTileIndices = getTileIndices;
    this._tileToBoundingBox = tileToBoundingBox;
    this.onTileError = onTileError;
    this.onTileLoad = onTileLoad;
    // Maps tile id in string {z}-{x}-{y} to a Tile object
    this._cache = new Map();
    this._tiles = [];
    this._dirty = false;

    // Cache the last processed viewport
    this._viewport = null;
    this._selectedTiles = null;
    this._frameNumber = 0;

    if (Number.isFinite(maxZoom)) {
      this._maxZoom = Math.floor(maxZoom);
    }
    if (Number.isFinite(minZoom)) {
      this._minZoom = Math.ceil(minZoom);
    }
  }

  get tiles() {
    return this._tiles;
  }

  get isLoaded() {
    return this._selectedTiles.every(tile => tile.isLoaded);
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
  update(viewport) {
    const {_cache, _getTileIndices, _maxSize, _maxZoom, _minZoom} = this;

    let selectedTiles = this._selectedTiles;

    if (viewport !== this._viewport) {
      const tileIndices = _getTileIndices(viewport, _maxZoom, _minZoom);
      selectedTiles = tileIndices.map(({x, y, z}) => this._getTile(x, y, z, true));
      this._selectedTiles = selectedTiles;

      if (this._dirty) {
        // Some new tiles are added
        this._rebuildTree();
      }
    }

    // Update tile states
    this._updateTileStates(selectedTiles);

    let changed = false;
    for (const tile of _cache.values()) {
      const isVisible = Boolean(tile.state & TILE_STATE_VISIBLE);
      if (tile.isVisible !== isVisible) {
        changed = true;
        tile.isVisible = isVisible;
      }
    }

    if (this._dirty) {
      // cache size is either the user defined maxSize or 5 * number of current tiles in the viewport.
      const commonZoomRange = 5;
      this._resizeCache(_maxSize || commonZoomRange * selectedTiles.length);
      this._dirty = false;
    }

    if (changed) {
      this._frameNumber++;
    }
    return this._frameNumber;
  }

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

    // Reset states
    for (const tile of _cache.values()) {
      tile.state = TILE_STATE_UNKNOWN;
    }

    // For all the selected && pending tiles:
    // - pick the closest ancestor as placeholder
    // - if no ancestor is visible, pick the closest children as placeholder
    for (const tile of selectedTiles) {
      tile.state = TILE_STATE_SELECTED;
      getPlaceholderInAncestors(tile, this._strategy);
    }

    // updateAncestorStates(selectedTiles);

    for (const tile of selectedTiles) {
      if (needsPlaceholder(tile)) {
        getPlaceholderInChildren(tile);
      }
    }
  }

  /**
   * Clear tiles that are not visible when the cache is full
   */
  _resizeCache(maxSize) {
    const {_cache} = this;
    if (_cache.size > maxSize) {
      for (const [tileId, tile] of _cache) {
        if (!tile.isVisible) {
          _cache.delete(tileId);
        }
        if (_cache.size <= maxSize) {
          break;
        }
      }
      this._rebuildTree();
    }
    this._tiles = Array.from(this._cache.values())
      // sort by zoom level so that smaller tiles are displayed on top
      .sort((t1, t2) => t1.z - t2.z);
  }

  _getTile(x, y, z, create) {
    const tileId = `${z}-${x}-${y}`;
    let tile = this._cache.get(tileId);

    if (!tile && create) {
      tile = new Tile({
        getTileData: this._getTileData,
        tileToBoundingBox: this._tileToBoundingBox,
        x,
        y,
        z,
        onTileLoad: this.onTileLoad,
        onTileError: this.onTileError
      });
      this._cache.set(tileId, tile);
      this._dirty = true;
    }
    return tile;
  }

  _getNearestAncestor(x, y, z) {
    const {_minZoom = 0} = this;

    while (z > _minZoom) {
      x = Math.floor(x / 2);
      y = Math.floor(y / 2);
      z -= 1;
      const parent = this._getTile(x, y, z);
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

function getPlaceholderInAncestors(tile, strategy) {
  let parent;
  let state = TILE_STATE_PLACEHOLDER;
  while ((parent = tile.parent)) {
    if (tile.isLoaded) {
      // If a tile is loaded, mark all its ancestors as hidden
      state = TILE_STATE_HIDDEN;
      if (strategy === STRATEGY_DEFAULT) {
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
