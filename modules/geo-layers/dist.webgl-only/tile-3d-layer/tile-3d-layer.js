// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { Geometry } from '@luma.gl/engine';
import { CompositeLayer, COORDINATE_SYSTEM, log } from '@deck.gl/core';
import { PointCloudLayer } from '@deck.gl/layers';
import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import { default as MeshLayer } from "../mesh-layer/mesh-layer.js";
import { load } from '@loaders.gl/core';
import { Tileset3D, TILE_TYPE } from '@loaders.gl/tiles';
import { Tiles3DLoader } from '@loaders.gl/3d-tiles';
const SINGLE_DATA = [0];
const defaultProps = {
    getPointColor: { type: 'accessor', value: [0, 0, 0, 255] },
    pointSize: 1.0,
    // Disable async data loading (handling it in _loadTileSet)
    data: '',
    loader: Tiles3DLoader,
    onTilesetLoad: { type: 'function', value: tileset3d => { } },
    onTileLoad: { type: 'function', value: tileHeader => { } },
    onTileUnload: { type: 'function', value: tileHeader => { } },
    onTileError: { type: 'function', value: (tile, message, url) => { } },
    _getMeshColor: { type: 'function', value: tileHeader => [255, 255, 255] }
};
/** Render 3d tiles data formatted according to the [3D Tiles Specification](https://www.opengeospatial.org/standards/3DTiles) and [`ESRI I3S`](https://github.com/Esri/i3s-spec) */
class Tile3DLayer extends CompositeLayer {
    initializeState() {
        if ('onTileLoadFail' in this.props) {
            log.removed('onTileLoadFail', 'onTileError')();
        }
        // prop verification
        this.state = {
            layerMap: {},
            tileset3d: null,
            activeViewports: {},
            lastUpdatedViewports: null
        };
    }
    get isLoaded() {
        return Boolean(this.state?.tileset3d?.isLoaded() && super.isLoaded);
    }
    shouldUpdateState({ changeFlags }) {
        return changeFlags.somethingChanged;
    }
    updateState({ props, oldProps, changeFlags }) {
        if (props.data && props.data !== oldProps.data) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this._loadTileset(props.data);
        }
        if (changeFlags.viewportChanged) {
            const { activeViewports } = this.state;
            const viewportsNumber = Object.keys(activeViewports).length;
            if (viewportsNumber) {
                this._updateTileset(activeViewports);
                this.state.lastUpdatedViewports = activeViewports;
                this.state.activeViewports = {};
            }
        }
        if (changeFlags.propsChanged) {
            const { layerMap } = this.state;
            for (const key in layerMap) {
                layerMap[key].needsUpdate = true;
            }
        }
    }
    finalizeState(context) {
        this.state.tileset3d?.destroy();
        this.state.tileset3d = null;
        this.state.layerMap = {};
        this.state.activeViewports = {};
        this.state.lastUpdatedViewports = null;
        super.finalizeState(context);
    }
    activateViewport(viewport) {
        const { activeViewports, lastUpdatedViewports } = this.state;
        this.internalState.viewport = viewport;
        activeViewports[viewport.id] = viewport;
        const lastViewport = lastUpdatedViewports?.[viewport.id];
        if (!lastViewport || !viewport.equals(lastViewport)) {
            this.setChangeFlags({ viewportChanged: true });
            this.setNeedsUpdate();
        }
    }
    getPickingInfo({ info, sourceLayer }) {
        const sourceTile = sourceLayer && sourceLayer.props.tile;
        if (info.picked) {
            info.object = sourceTile;
        }
        info.sourceTile = sourceTile;
        return info;
    }
    filterSubLayer({ layer, viewport, cullRect, isPicking }) {
        // All sublayers will have a tile prop
        const { tile } = layer.props;
        const { id: viewportId } = viewport;
        if (!tile.selected || !tile.viewportIds.includes(viewportId)) {
            return false;
        }
        // When picking, skip tiles whose content center is far from the
        // pick point on screen. Avoids unnecessary draw calls.
        if (isPicking && cullRect && tile.content?.cartographicOrigin) {
            const [sx, sy] = viewport.project(tile.content.cartographicOrigin);
            const cx = cullRect.x + cullRect.width / 2;
            const cy = cullRect.y + cullRect.height / 2;
            const threshold = Math.max(viewport.width, viewport.height) / 4;
            const dx = sx - cx;
            const dy = sy - cy;
            if (dx * dx + dy * dy > threshold * threshold) {
                return false;
            }
        }
        return true;
    }
    _updateAutoHighlight(info) {
        const sourceTile = info.sourceTile;
        const layerCache = this.state.layerMap[sourceTile?.id];
        if (layerCache && layerCache.layer) {
            layerCache.layer.updateAutoHighlight(info);
        }
    }
    async _loadTileset(tilesetUrl) {
        const loadOptions = this.props.loadOptions || {};
        // TODO: deprecate `loader` in v9.0
        // @ts-ignore
        const loaders = this.props.loaders?.length ? this.props.loaders : this.props.loader;
        const loader = Array.isArray(loaders) ? loaders[0] : loaders;
        // Extract tileset-specific options so they are passed to the Tileset3D constructor
        const { tileset: tilesetOptions, ...remainingLoadOptions } = loadOptions;
        const options = { loadOptions: { ...remainingLoadOptions }, ...tilesetOptions };
        let actualTilesetUrl = tilesetUrl;
        if ('preload' in loader && typeof loader.preload === 'function') {
            const preloadOptions = await loader.preload(tilesetUrl, loadOptions);
            if (preloadOptions.url) {
                actualTilesetUrl = preloadOptions.url;
            }
            if (preloadOptions.headers) {
                options.loadOptions.core = {
                    ...options.loadOptions.core,
                    fetch: {
                        ...options.loadOptions.core?.fetch,
                        headers: preloadOptions.headers
                    }
                };
            }
            Object.assign(options, preloadOptions);
        }
        const tilesetJson = await load(actualTilesetUrl, loader, options.loadOptions);
        const tileset3d = new Tileset3D(tilesetJson, {
            onTileLoad: this._onTileLoad.bind(this),
            onTileUnload: this._onTileUnload.bind(this),
            onTileError: this.props.onTileError,
            onUpdate: () => this.setNeedsUpdate(),
            ...options
        });
        this.setState({
            tileset3d,
            layerMap: {}
        });
        this._updateTileset(this.state.activeViewports);
        this.props.onTilesetLoad(tileset3d);
    }
    _onTileLoad(tileHeader) {
        const { lastUpdatedViewports } = this.state;
        // Mark as not yet drawn so transition hold keeps previous tiles
        // visible until this tile's sublayer renders for the first time
        tileHeader.tileDrawn = false;
        this.props.onTileLoad(tileHeader);
        this._updateTileset(lastUpdatedViewports);
        this.setNeedsUpdate();
    }
    _onTileUnload(tileHeader) {
        // Was cleaned up from tileset cache. We no longer need to track it.
        delete this.state.layerMap[tileHeader.id];
        this.props.onTileUnload(tileHeader);
    }
    _updateTileset(viewports) {
        if (!viewports) {
            return;
        }
        const { tileset3d } = this.state;
        const { timeline } = this.context;
        const viewportsNumber = Object.keys(viewports).length;
        if (!timeline || !viewportsNumber || !tileset3d) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        tileset3d.selectTiles(Object.values(viewports)).then(frameNumber => {
            const tilesetChanged = this.state.frameNumber !== frameNumber;
            if (tilesetChanged) {
                this.setState({ frameNumber });
            }
        });
    }
    _getSubLayer(tileHeader, oldLayer) {
        if (!tileHeader.content) {
            return null;
        }
        switch (tileHeader.type) {
            case TILE_TYPE.POINTCLOUD:
                return this._makePointCloudLayer(tileHeader, oldLayer);
            case TILE_TYPE.SCENEGRAPH:
                return this._make3DModelLayer(tileHeader);
            case TILE_TYPE.MESH:
                return this._makeSimpleMeshLayer(tileHeader, oldLayer);
            default:
                throw new Error(`Tile3DLayer: Failed to render layer of type ${tileHeader.content.type}`);
        }
    }
    _makePointCloudLayer(tileHeader, oldLayer) {
        const { attributes, pointCount, constantRGBA, cartographicOrigin, modelMatrix } = tileHeader.content;
        const { positions, normals, colors } = attributes;
        if (!positions) {
            return null;
        }
        const data = (oldLayer && oldLayer.props.data) || {
            header: {
                vertexCount: pointCount
            },
            attributes: {
                POSITION: positions,
                NORMAL: normals,
                COLOR_0: colors
            }
        };
        const { pointSize, getPointColor } = this.props;
        const SubLayerClass = this.getSubLayerClass('pointcloud', PointCloudLayer);
        return new SubLayerClass({
            pointSize
        }, this.getSubLayerProps({
            id: 'pointcloud'
        }), {
            id: `${this.id}-pointcloud-${tileHeader.id}`,
            tile: tileHeader,
            data,
            coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
            coordinateOrigin: cartographicOrigin,
            modelMatrix,
            getColor: constantRGBA || getPointColor,
            _offset: 0
        });
    }
    _make3DModelLayer(tileHeader) {
        const { gltf, instances, cartographicOrigin, modelMatrix } = tileHeader.content;
        const SubLayerClass = this.getSubLayerClass('scenegraph', ScenegraphLayer);
        return new SubLayerClass({
            _lighting: 'pbr'
        }, this.getSubLayerProps({
            id: 'scenegraph'
        }), {
            id: `${this.id}-scenegraph-${tileHeader.id}`,
            tile: tileHeader,
            data: instances || SINGLE_DATA,
            scenegraph: gltf,
            coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
            coordinateOrigin: cartographicOrigin,
            modelMatrix,
            getTransformMatrix: instance => instance.modelMatrix,
            getPosition: [0, 0, 0],
            _offset: 0,
            onFirstDraw: () => {
                tileHeader.tileDrawn = true;
            }
        });
    }
    _makeSimpleMeshLayer(tileHeader, oldLayer) {
        const content = tileHeader.content;
        const { attributes, indices, modelMatrix, cartographicOrigin, coordinateSystem = COORDINATE_SYSTEM.METER_OFFSETS, material, featureIds } = content;
        const { _getMeshColor } = this.props;
        const geometry = (oldLayer && oldLayer.props.mesh) ||
            new Geometry({
                topology: 'triangle-list',
                attributes: getMeshGeometry(attributes),
                indices
            });
        const SubLayerClass = this.getSubLayerClass('mesh', MeshLayer);
        return new SubLayerClass(this.getSubLayerProps({
            id: 'mesh'
        }), {
            id: `${this.id}-mesh-${tileHeader.id}`,
            tile: tileHeader,
            mesh: geometry,
            data: SINGLE_DATA,
            getColor: _getMeshColor(tileHeader),
            pbrMaterial: material,
            modelMatrix,
            coordinateOrigin: cartographicOrigin,
            coordinateSystem,
            featureIds,
            _offset: 0
        });
    }
    renderLayers() {
        const { tileset3d, layerMap } = this.state;
        if (!tileset3d) {
            return null;
        }
        // loaders.gl doesn't provide a type for tileset3d.tiles
        return tileset3d.tiles
            .map(tile => {
            const layerCache = (layerMap[tile.id] = layerMap[tile.id] || { tile });
            let { layer } = layerCache;
            if (tile.selected) {
                // render selected tiles
                if (!layer) {
                    // create layer
                    layer = this._getSubLayer(tile);
                }
                else if (layerCache.needsUpdate) {
                    // props have changed, rerender layer
                    layer = this._getSubLayer(tile, layer);
                    layerCache.needsUpdate = false;
                }
            }
            layerCache.layer = layer;
            return layer;
        })
            .filter(Boolean);
    }
}
Tile3DLayer.defaultProps = defaultProps;
Tile3DLayer.layerName = 'Tile3DLayer';
export default Tile3DLayer;
function getMeshGeometry(contentAttributes) {
    const attributes = {};
    attributes.positions = {
        ...contentAttributes.positions,
        value: new Float32Array(contentAttributes.positions.value)
    };
    if (contentAttributes.normals) {
        attributes.normals = contentAttributes.normals;
    }
    if (contentAttributes.texCoords) {
        attributes.texCoords = contentAttributes.texCoords;
    }
    if (contentAttributes.colors) {
        attributes.colors = contentAttributes.colors;
    }
    if (contentAttributes.uvRegions) {
        attributes.uvRegions = contentAttributes.uvRegions;
    }
    return attributes;
}
//# sourceMappingURL=tile-3d-layer.js.map