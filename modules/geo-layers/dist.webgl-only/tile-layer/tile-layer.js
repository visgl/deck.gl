// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { CompositeLayer, _flatten as flatten } from '@deck.gl/core';
import { GeoJsonLayer } from '@deck.gl/layers';
import { Tileset2D, STRATEGY_DEFAULT } from "../tileset-2d/index.js";
import { urlType, getURLFromTemplate } from "../tileset-2d/index.js";
import { Matrix4 } from '@math.gl/core';
const defaultProps = {
    TilesetClass: Tileset2D,
    data: { type: 'data', value: [] },
    dataComparator: urlType.equal,
    renderSubLayers: { type: 'function', value: (props) => new GeoJsonLayer(props) },
    getTileData: { type: 'function', optional: true, value: null },
    // TODO - change to onViewportLoad to align with Tile3DLayer
    onViewportLoad: { type: 'function', optional: true, value: null },
    onTileLoad: { type: 'function', value: tile => { } },
    onTileUnload: { type: 'function', value: tile => { } },
    // eslint-disable-next-line
    onTileError: { type: 'function', value: err => console.error(err) },
    extent: { type: 'array', optional: true, value: null, compare: true },
    tileSize: 512,
    maxZoom: null,
    minZoom: 0,
    maxCacheSize: null,
    maxCacheByteSize: null,
    refinementStrategy: STRATEGY_DEFAULT,
    zRange: null,
    maxRequests: 6,
    debounceTime: 0,
    zoomOffset: 0,
    visibleMinZoom: null,
    visibleMaxZoom: null
};
/**
 * The TileLayer is a composite layer that makes it possible to visualize very large datasets.
 *
 * Instead of fetching the entire dataset, it only loads and renders what's visible in the current viewport.
 */
class TileLayer extends CompositeLayer {
    initializeState() {
        this.state = {
            tileset: null,
            isLoaded: false
        };
    }
    finalizeState() {
        this.state?.tileset?.finalize();
    }
    get isLoaded() {
        return Boolean(this.state?.tileset?.selectedTiles?.every(tile => 
        // Error / empty tiles resolve to `content === null`. Once Tile2DHeader marks those
        // requests as loaded, do not wait for generated sublayers because there is nothing to
        // render for that tile and `tile.layers` will remain null.
        tile.isLoaded &&
            (!tile.content || !tile.layers || tile.layers.every(layer => layer.isLoaded))));
    }
    shouldUpdateState({ changeFlags }) {
        return changeFlags.somethingChanged;
    }
    updateState({ changeFlags }) {
        let { tileset } = this.state;
        const propsChanged = changeFlags.propsOrDataChanged || changeFlags.updateTriggersChanged;
        const dataChanged = changeFlags.dataChanged ||
            (changeFlags.updateTriggersChanged &&
                (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getTileData));
        if (!tileset) {
            tileset = new this.props.TilesetClass(this._getTilesetOptions());
            this.setState({ tileset });
        }
        else if (propsChanged) {
            tileset.setOptions(this._getTilesetOptions());
            if (dataChanged) {
                // reload all tiles
                // use cached layers until new content is loaded
                tileset.reloadAll();
            }
            else {
                // some render options changed, regenerate sub layers now
                tileset.tiles.forEach(tile => {
                    tile.layers = null;
                });
            }
        }
        this._updateTileset();
    }
    _getTilesetOptions() {
        const { tileSize, maxCacheSize, maxCacheByteSize, refinementStrategy, extent, maxZoom, minZoom, maxRequests, debounceTime, zoomOffset, visibleMinZoom, visibleMaxZoom } = this.props;
        return {
            maxCacheSize,
            maxCacheByteSize,
            maxZoom,
            minZoom,
            tileSize,
            refinementStrategy,
            extent,
            maxRequests,
            debounceTime,
            zoomOffset,
            visibleMinZoom,
            visibleMaxZoom,
            getTileData: this.getTileData.bind(this),
            onTileLoad: this._onTileLoad.bind(this),
            onTileError: this._onTileError.bind(this),
            onTileUnload: this._onTileUnload.bind(this)
        };
    }
    _updateTileset() {
        const tileset = this.state.tileset;
        const { zRange, modelMatrix } = this.props;
        const frameNumber = tileset.update(this.context.viewport, { zRange, modelMatrix });
        const { isLoaded } = tileset;
        const loadingStateChanged = this.state.isLoaded !== isLoaded;
        const tilesetChanged = this.state.frameNumber !== frameNumber;
        if (isLoaded && (loadingStateChanged || tilesetChanged)) {
            this._onViewportLoad();
        }
        if (tilesetChanged) {
            // Save the tileset frame number - trigger a rerender
            this.setState({ frameNumber });
        }
        // Save the loaded state - should not trigger a rerender
        this.state.isLoaded = isLoaded;
    }
    _onViewportLoad() {
        const { tileset } = this.state;
        const { onViewportLoad } = this.props;
        if (onViewportLoad) {
            // This method can only be called when tileset is defined and updated
            onViewportLoad(tileset.selectedTiles);
        }
    }
    _onTileLoad(tile) {
        this.props.onTileLoad(tile);
        tile.layers = null;
        this.setNeedsUpdate();
    }
    _onTileError(error, tile) {
        this.props.onTileError(error);
        tile.layers = null;
        this.setNeedsUpdate();
    }
    _onTileUnload(tile) {
        this.props.onTileUnload(tile);
    }
    // Methods for subclass to override
    getTileData(tile) {
        const { data, getTileData, fetch } = this.props;
        const { signal } = tile;
        tile.url =
            typeof data === 'string' || Array.isArray(data) ? getURLFromTemplate(data, tile) : null;
        if (getTileData) {
            return getTileData(tile);
        }
        if (fetch && tile.url) {
            return fetch(tile.url, { propName: 'data', layer: this, signal });
        }
        return null;
    }
    renderSubLayers(props) {
        return this.props.renderSubLayers(props);
    }
    getSubLayerPropsByTile(tile) {
        return null;
    }
    getPickingInfo(params) {
        // TileLayer does not directly render anything, sourceLayer cannot be null
        const sourceLayer = params.sourceLayer;
        const sourceTile = sourceLayer.props.tile;
        const info = params.info;
        if (info.picked) {
            info.tile = sourceTile;
        }
        info.sourceTile = sourceTile;
        info.sourceTileSubLayer = sourceLayer;
        return info;
    }
    _updateAutoHighlight(info) {
        info.sourceTileSubLayer.updateAutoHighlight(info);
    }
    renderLayers() {
        const { visibleMinZoom, visibleMaxZoom, minZoom, extent } = this.props;
        const zoom = this.context.viewport.zoom;
        const hidden = (visibleMinZoom != null && zoom < visibleMinZoom) ||
            (visibleMaxZoom != null && zoom > visibleMaxZoom) ||
            (minZoom != null && !extent && zoom < minZoom);
        if (hidden) {
            // Clear cached sublayer references so they are recreated when visible again
            for (const tile of this.state.tileset.tiles) {
                tile.layers = null;
            }
            return [];
        }
        return this.state.tileset.tiles.map((tile) => {
            const subLayerProps = this.getSubLayerPropsByTile(tile);
            // cache the rendered layer in the tile
            if (!tile.isLoaded && !tile.content) {
                // nothing to show
            }
            else if (!tile.layers) {
                const layers = this.renderSubLayers({
                    ...this.props,
                    ...this.getSubLayerProps({
                        id: tile.id,
                        updateTriggers: this.props.updateTriggers
                    }),
                    data: tile.content,
                    _offset: 0,
                    tile
                });
                tile.layers = flatten(layers, Boolean).map(layer => layer.clone({
                    tile,
                    ...subLayerProps
                }));
            }
            else if (subLayerProps &&
                tile.layers[0] &&
                Object.keys(subLayerProps).some(propName => tile.layers[0].props[propName] !== subLayerProps[propName])) {
                tile.layers = tile.layers.map(layer => layer.clone(subLayerProps));
            }
            return tile.layers;
        });
    }
    filterSubLayer({ layer, cullRect }) {
        const { tile } = layer.props;
        const { modelMatrix } = this.props;
        return this.state.tileset.isTileVisible(tile, cullRect, modelMatrix ? new Matrix4(modelMatrix) : null);
    }
}
TileLayer.defaultProps = defaultProps;
TileLayer.layerName = 'TileLayer';
export default TileLayer;
//# sourceMappingURL=tile-layer.js.map