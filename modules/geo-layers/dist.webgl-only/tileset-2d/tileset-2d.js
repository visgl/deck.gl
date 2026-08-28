// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { RequestScheduler } from '@loaders.gl/loader-utils';
import { Matrix4, equals } from '@math.gl/core';
import { Tile2DHeader } from "./tile-2d-header.js";
import { getTileIndices, tileToBoundingBox, getCullBounds, transformBox } from "./utils.js";
import { memoize } from "./memoize.js";
// bit masks
const TILE_STATE_VISITED = 1;
const TILE_STATE_VISIBLE = 2;
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
export const STRATEGY_NEVER = 'never';
export const STRATEGY_REPLACE = 'no-overlap';
export const STRATEGY_DEFAULT = 'best-available';
const DEFAULT_CACHE_SCALE = 5;
const SELECTED_TILE_PRIORITY = 0;
const VISIBLE_TILE_PRIORITY = 1e8;
const MAX_TILE_DISTANCE_PRIORITY = VISIBLE_TILE_PRIORITY - SELECTED_TILE_PRIORITY - 1;
const STRATEGIES = {
    [STRATEGY_DEFAULT]: updateTileStateDefault,
    [STRATEGY_REPLACE]: updateTileStateReplace,
    [STRATEGY_NEVER]: () => { }
};
export const DEFAULT_TILESET2D_PROPS = {
    extent: null,
    tileSize: 512,
    maxZoom: null,
    minZoom: null,
    maxCacheSize: null,
    maxCacheByteSize: null,
    refinementStrategy: 'best-available',
    zRange: null,
    maxRequests: 6,
    debounceTime: 0,
    zoomOffset: 0,
    visibleMinZoom: null,
    visibleMaxZoom: null,
    // onTileLoad: (tile: Tile2DHeader) => void,  // onTileUnload: (tile: Tile2DHeader) => void,  // onTileError: (error: any, tile: Tile2DHeader) => void,  /** Called when all tiles in the current viewport are loaded. */
    // onViewportLoad: ((tiles: Tile2DHeader<DataT>[]) => void) | null,
    onTileLoad: () => { },
    onTileUnload: () => { },
    onTileError: () => { }
};
/**
 * Manages loading and purging of tile data. This class caches recently visited tiles
 * and only creates new tiles if they are present.
 */
export class Tileset2D {
    /**
     * Takes in a function that returns tile data, a cache size, and a max and a min zoom level.
     * Cache size defaults to 5 * number of tiles in the current viewport
     */
    constructor(opts) {
        /* Private methods */
        this._getCullBounds = memoize(getCullBounds);
        this.opts = { ...DEFAULT_TILESET2D_PROPS, ...opts };
        this.setOptions(this.opts);
        this.onTileLoad = tile => {
            this.opts.onTileLoad?.(tile);
            if (this.opts.maxCacheByteSize !== null) {
                this._cacheByteSize += tile.byteLength;
                this._resizeCache();
            }
        };
        this._requestScheduler = new RequestScheduler({
            throttleRequests: this.opts.maxRequests > 0 || this.opts.debounceTime > 0,
            maxRequests: this.opts.maxRequests,
            debounceTime: this.opts.debounceTime
        });
        // Maps tile id in string {z}-{x}-{y} to a Tile object
        this._cache = new Map();
        this._tiles = [];
        this._dirty = false;
        this._cacheByteSize = 0;
        // Cache the last processed viewport
        this._viewport = null;
        this._zRange = null;
        this._selectedTiles = null;
        this._frameNumber = 0;
        this._modelMatrix = new Matrix4();
        this._modelMatrixInverse = new Matrix4();
    }
    /* Public API */
    get tiles() {
        return this._tiles;
    }
    get selectedTiles() {
        return this._selectedTiles;
    }
    get isLoaded() {
        return this._selectedTiles !== null && this._selectedTiles.every(tile => tile.isLoaded);
    }
    get needsReload() {
        return this._selectedTiles !== null && this._selectedTiles.some(tile => tile.needsReload);
    }
    setOptions(opts) {
        Object.assign(this.opts, opts);
        if (Number.isFinite(opts.maxZoom)) {
            this._maxZoom = Math.floor(opts.maxZoom);
        }
        if (Number.isFinite(opts.minZoom)) {
            this._minZoom = Math.ceil(opts.minZoom);
        }
        // Force re-evaluation of tile indices on next update
        this._viewport = null;
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
        for (const id of this._cache.keys()) {
            const tile = this._cache.get(id);
            if (!this._selectedTiles || !this._selectedTiles.includes(tile)) {
                this._cache.delete(id);
            }
            else {
                tile.setNeedsReload();
            }
        }
    }
    /**
     * Update the cache with the given viewport and model matrix and triggers callback onUpdate.
     */
    update(viewport, { zRange, modelMatrix } = {
        zRange: null,
        modelMatrix: null
    }) {
        const modelMatrixAsMatrix4 = modelMatrix ? new Matrix4(modelMatrix) : new Matrix4();
        const isModelMatrixNew = !modelMatrixAsMatrix4.equals(this._modelMatrix);
        if (!this._viewport ||
            !viewport.equals(this._viewport) ||
            !equals(this._zRange, zRange) ||
            isModelMatrixNew) {
            if (isModelMatrixNew) {
                this._modelMatrixInverse = modelMatrixAsMatrix4.clone().invert();
                this._modelMatrix = modelMatrixAsMatrix4;
            }
            this._viewport = viewport;
            this._zRange = zRange;
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
            // Check for needed reloads explicitly even if the view/matrix has not changed.
        }
        else if (this.needsReload) {
            this._selectedTiles = this._selectedTiles.map(tile => this._getTile(tile.index, true));
        }
        // Update tile states
        const changed = this.updateTileStates();
        this._pruneRequests();
        if (this._dirty) {
            // cache size is either the user defined maxSize or 5 * number of current tiles in the viewport.
            this._resizeCache();
        }
        if (changed) {
            this._frameNumber++;
        }
        return this._frameNumber;
    }
    // eslint-disable-next-line complexity
    isTileVisible(tile, cullRect, modelMatrix) {
        if (!tile.isVisible) {
            return false;
        }
        if (cullRect && this._viewport) {
            const boundsArr = this._getCullBounds({
                viewport: this._viewport,
                z: this._zRange,
                cullRect
            });
            let { bbox } = tile;
            for (const [minX, minY, maxX, maxY] of boundsArr) {
                let overlaps;
                if ('west' in bbox) {
                    overlaps = bbox.west < maxX && bbox.east > minX && bbox.south < maxY && bbox.north > minY;
                }
                else {
                    if (modelMatrix && !Matrix4.IDENTITY.equals(modelMatrix)) {
                        const [left, top, right, bottom] = transformBox([bbox.left, bbox.top, bbox.right, bbox.bottom], modelMatrix);
                        bbox = { left, top, right, bottom };
                    }
                    // top/bottom could be swapped depending on the indexing system
                    const y0 = Math.min(bbox.top, bbox.bottom);
                    const y1 = Math.max(bbox.top, bbox.bottom);
                    overlaps = bbox.left < maxX && bbox.right > minX && y0 < maxY && y1 > minY;
                }
                if (overlaps) {
                    return true;
                }
            }
            return false;
        }
        return true;
    }
    /* Public interface for subclassing */
    /** Returns array of tile indices in the current viewport */
    getTileIndices({ viewport, maxZoom, minZoom, zRange, modelMatrix, modelMatrixInverse }) {
        const { tileSize, extent, zoomOffset, visibleMinZoom, visibleMaxZoom } = this.opts;
        return getTileIndices({
            viewport,
            maxZoom,
            minZoom,
            zRange,
            tileSize,
            extent: extent,
            modelMatrix,
            modelMatrixInverse,
            zoomOffset,
            visibleMinZoom,
            visibleMaxZoom
        });
    }
    /** Returns unique string key for a tile index */
    getTileId(index) {
        return `${index.x}-${index.y}-${index.z}`;
    }
    /** Returns a zoom level for a tile index */
    getTileZoom(index) {
        return index.z;
    }
    /** Returns additional metadata to add to tile, bbox by default */
    getTileMetadata(index) {
        const { tileSize } = this.opts;
        return { bbox: tileToBoundingBox(this._viewport, index.x, index.y, index.z, tileSize) };
    }
    /** Returns index of the parent tile */
    getParentIndex(index) {
        const x = Math.floor(index.x / 2);
        const y = Math.floor(index.y / 2);
        const z = index.z - 1;
        return { x, y, z };
    }
    // Returns true if any tile's visibility changed
    updateTileStates() {
        const refinementStrategy = this.opts.refinementStrategy || STRATEGY_DEFAULT;
        const visibilities = new Array(this._cache.size);
        let i = 0;
        // Reset state
        for (const tile of this._cache.values()) {
            // save previous state
            visibilities[i++] = tile.isVisible;
            tile.isSelected = false;
            tile.isVisible = false;
        }
        // @ts-expect-error called only when _selectedTiles is already defined
        for (const tile of this._selectedTiles) {
            tile.isSelected = true;
            tile.isVisible = true;
        }
        // Strategy-specific state logic
        (typeof refinementStrategy === 'function'
            ? refinementStrategy
            : STRATEGIES[refinementStrategy])(Array.from(this._cache.values()));
        i = 0;
        // Check if any visibility has changed
        for (const tile of this._cache.values()) {
            if (visibilities[i++] !== tile.isVisible) {
                return true;
            }
        }
        return false;
    }
    _getRequestPriority(tile) {
        if (!tile.isSelected && !tile.isVisible) {
            return -1;
        }
        // RequestScheduler loads lower priority values first.
        const distance = this._getTileDistancePriority(tile);
        if (tile.isSelected) {
            return SELECTED_TILE_PRIORITY + distance;
        }
        return VISIBLE_TILE_PRIORITY + distance;
    }
    _getTileDistancePriority(tile) {
        const { width, height } = this._viewport || {};
        if (!this._viewport || !width || !height) {
            return 0;
        }
        try {
            const points = this._getTileScreenCorners(tile.bbox);
            const center = [width / 2, height / 2];
            if (points.length === 4) {
                if (this._isPointInPolygon(center, points)) {
                    return 0;
                }
                const distance = points.reduce((minDistance, point, i) => {
                    const nextPoint = points[(i + 1) % points.length];
                    return Math.min(minDistance, this._getPointToSegmentDistanceSquared(center, point, nextPoint));
                }, Number.MAX_SAFE_INTEGER);
                return Math.min(distance, MAX_TILE_DISTANCE_PRIORITY);
            }
        }
        catch {
            // Some viewport/tile combinations are not projectable. Keep them valid but last in tier.
        }
        return MAX_TILE_DISTANCE_PRIORITY;
    }
    _getTileScreenCorners(bbox) {
        const coordinates = 'west' in bbox
            ? [
                [bbox.west, bbox.south],
                [bbox.east, bbox.south],
                [bbox.east, bbox.north],
                [bbox.west, bbox.north]
            ]
            : [
                [bbox.left, bbox.top],
                [bbox.right, bbox.top],
                [bbox.right, bbox.bottom],
                [bbox.left, bbox.bottom]
            ];
        return coordinates
            .map(coordinate => this._viewport.project(coordinate))
            .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
    }
    _isPointInPolygon(point, polygon) {
        let inside = false;
        const [x, y] = point;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const [xi, yi] = polygon[i];
            const [xj, yj] = polygon[j];
            if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
                inside = !inside;
            }
        }
        return inside;
    }
    _getPointToSegmentDistanceSquared(point, segmentStart, segmentEnd) {
        const [x, y] = point;
        const [x1, y1] = segmentStart;
        const [x2, y2] = segmentEnd;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSquared = dx * dx + dy * dy;
        const t = lengthSquared
            ? Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / lengthSquared))
            : 0;
        const segmentX = x1 + t * dx;
        const segmentY = y1 + t * dy;
        const distanceX = x - segmentX;
        const distanceY = y - segmentY;
        return distanceX * distanceX + distanceY * distanceY;
    }
    _pruneRequests() {
        const { maxRequests = 0 } = this.opts;
        const abortCandidates = [];
        let ongoingRequestCount = 0;
        for (const tile of this._cache.values()) {
            // Keep track of all the ongoing requests
            if (tile.isLoading) {
                ongoingRequestCount++;
                if (!tile.isSelected && !tile.isVisible) {
                    abortCandidates.push(tile);
                }
            }
        }
        while (maxRequests > 0 && ongoingRequestCount > maxRequests && abortCandidates.length > 0) {
            // There are too many ongoing requests, so abort some that are unselected
            const tile = abortCandidates.shift();
            tile.abort();
            ongoingRequestCount--;
        }
    }
    // This needs to be called every time some tiles have been added/removed from cache
    _rebuildTree() {
        const { _cache } = this;
        // Reset states
        for (const tile of _cache.values()) {
            tile.parent = null;
            if (tile.children) {
                tile.children.length = 0;
            }
        }
        // Rebuild tree
        for (const tile of _cache.values()) {
            const parent = this._getNearestAncestor(tile);
            tile.parent = parent;
            if (parent?.children) {
                parent.children.push(tile);
            }
        }
    }
    /**
     * Clear tiles that are not visible when the cache is full
     */
    /* eslint-disable complexity */
    _resizeCache() {
        const { _cache, opts } = this;
        const maxCacheSize = opts.maxCacheSize ??
            // @ts-expect-error called only when selectedTiles is initialized
            (opts.maxCacheByteSize !== null ? Infinity : DEFAULT_CACHE_SCALE * this.selectedTiles.length);
        const maxCacheByteSize = opts.maxCacheByteSize ?? Infinity;
        const overflown = _cache.size > maxCacheSize || this._cacheByteSize > maxCacheByteSize;
        if (overflown) {
            for (const [id, tile] of _cache) {
                if (!tile.isVisible && !tile.isSelected) {
                    // delete tile
                    this._cacheByteSize -= opts.maxCacheByteSize !== null ? tile.byteLength : 0;
                    _cache.delete(id);
                    this.opts.onTileUnload?.(tile);
                }
                if (_cache.size <= maxCacheSize && this._cacheByteSize <= maxCacheByteSize) {
                    break;
                }
            }
            this._rebuildTree();
            this._dirty = true;
        }
        if (this._dirty) {
            // sort by zoom level so that smaller tiles are displayed on top
            this._tiles = Array.from(this._cache.values()).sort((t1, t2) => t1.zoom - t2.zoom);
            this._dirty = false;
        }
    }
    _getTile(index, create) {
        const id = this.getTileId(index);
        let tile = this._cache.get(id);
        let needsReload = false;
        if (!tile && create) {
            tile = new Tile2DHeader(index);
            Object.assign(tile, this.getTileMetadata(tile.index));
            Object.assign(tile, { id, zoom: this.getTileZoom(tile.index) });
            needsReload = true;
            this._cache.set(id, tile);
            this._dirty = true;
        }
        else if (tile && tile.needsReload) {
            needsReload = true;
        }
        if (tile && needsReload) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            tile.loadData({
                getData: this.opts.getTileData,
                getRequestPriority: this._getRequestPriority.bind(this),
                requestScheduler: this._requestScheduler,
                onLoad: this.onTileLoad,
                onError: this.opts.onTileError
            });
        }
        return tile;
    }
    _getNearestAncestor(tile) {
        const { _minZoom = 0 } = this;
        let index = tile.index;
        while (this.getTileZoom(index) > _minZoom) {
            index = this.getParentIndex(index);
            const parent = this._getTile(index);
            if (parent) {
                return parent;
            }
        }
        return null;
    }
}
/* -- Refinement strategies --*/
/* eslint-disable max-depth */
// For all the selected && pending tiles:
// - pick the closest ancestor as placeholder
// - if no ancestor is visible, pick the closest children as placeholder
function updateTileStateDefault(allTiles) {
    for (const tile of allTiles) {
        tile.state = 0;
    }
    for (const tile of allTiles) {
        if (tile.isSelected && !getPlaceholderInAncestors(tile)) {
            getPlaceholderInChildren(tile);
        }
    }
    for (const tile of allTiles) {
        tile.isVisible = Boolean(tile.state & TILE_STATE_VISIBLE);
    }
}
// Until a selected tile and all its selected siblings are loaded, use the closest ancestor as placeholder
function updateTileStateReplace(allTiles) {
    for (const tile of allTiles) {
        tile.state = 0;
    }
    for (const tile of allTiles) {
        if (tile.isSelected) {
            getPlaceholderInAncestors(tile);
        }
    }
    // Always process parents first
    const sortedTiles = Array.from(allTiles).sort((t1, t2) => t1.zoom - t2.zoom);
    for (const tile of sortedTiles) {
        tile.isVisible = Boolean(tile.state & TILE_STATE_VISIBLE);
        if (tile.children && (tile.isVisible || tile.state & TILE_STATE_VISITED)) {
            // If the tile is rendered, or if the tile has been explicitly hidden, hide all of its children
            for (const child of tile.children) {
                child.state = TILE_STATE_VISITED;
            }
        }
        else if (tile.isSelected) {
            getPlaceholderInChildren(tile);
        }
    }
}
// Walk up the tree until we find one ancestor that is loaded. Returns true if successful.
function getPlaceholderInAncestors(startTile) {
    let tile = startTile;
    while (tile) {
        if (tile.isLoaded || tile.content) {
            tile.state |= TILE_STATE_VISIBLE;
            return true;
        }
        tile = tile.parent;
    }
    return false;
}
// Recursively set children as placeholder
function getPlaceholderInChildren(tile) {
    for (const child of tile.children) {
        if (child.isLoaded || child.content) {
            child.state |= TILE_STATE_VISIBLE;
        }
        else {
            getPlaceholderInChildren(child);
        }
    }
}
//# sourceMappingURL=tileset-2d.js.map