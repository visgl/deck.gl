// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { CompositeLayer, COORDINATE_SYSTEM, _GlobeViewport as GlobeViewport, log } from '@deck.gl/core';
import { SimpleMeshLayer } from '@deck.gl/mesh-layers';
import { TerrainWorkerLoader } from '@loaders.gl/terrain';
import TileLayer from "../tile-layer/tile-layer.js";
import { getURLFromTemplate, urlType } from "../tileset-2d/index.js";
const DUMMY_DATA = [1];
const TILE_OVERLAP_PIXELS = 1;
const MIN_TERRAIN_MESH_MAX_ERROR = 1;
const MAX_LATITUDE = 90;
const MAX_LONGITUDE = 180;
const defaultProps = {
    ...TileLayer.defaultProps,
    // Image url that encodes height data
    elevationData: urlType,
    // Image url to use as texture
    texture: { ...urlType, optional: true },
    // Martini error tolerance in meters, smaller number -> more detailed mesh
    meshMaxError: { type: 'number', value: 4.0 },
    // Bounding box of the terrain image, [minX, minY, maxX, maxY] in world coordinates
    bounds: { type: 'array', value: null, optional: true, compare: true },
    // Color to use if texture is unavailable
    color: { type: 'color', value: [255, 255, 255] },
    // Object to decode height data, from (r, g, b) to height in meters
    elevationDecoder: {
        type: 'object',
        value: {
            rScaler: 1,
            gScaler: 0,
            bScaler: 0,
            offset: 0
        }
    },
    // Supply url to local terrain worker bundle. Only required if running offline and cannot access CDN.
    workerUrl: '',
    // Same as SimpleMeshLayer wireframe
    wireframe: false,
    material: true,
    loaders: [TerrainWorkerLoader]
};
// Turns array of templates into a single string to work around shallow change
function urlTemplateToUpdateTrigger(template) {
    if (Array.isArray(template)) {
        return template.join(';');
    }
    return template || '';
}
function getOverlappedBounds(bounds, tileSize, clampLngLat) {
    const xPad = ((bounds[2] - bounds[0]) / tileSize) * TILE_OVERLAP_PIXELS;
    const yPad = ((bounds[3] - bounds[1]) / tileSize) * TILE_OVERLAP_PIXELS;
    const overlappedBounds = [
        bounds[0] - xPad,
        bounds[1] - yPad,
        bounds[2] + xPad,
        bounds[3] + yPad
    ];
    if (!clampLngLat) {
        return overlappedBounds;
    }
    return [
        Math.max(overlappedBounds[0], -MAX_LONGITUDE),
        Math.max(overlappedBounds[1], -MAX_LATITUDE),
        Math.min(overlappedBounds[2], MAX_LONGITUDE),
        Math.min(overlappedBounds[3], MAX_LATITUDE)
    ];
}
function getEffectiveMeshMaxError(meshMaxError) {
    if (!Number.isFinite(meshMaxError) || meshMaxError <= 0) {
        return MIN_TERRAIN_MESH_MAX_ERROR;
    }
    return Math.max(meshMaxError, MIN_TERRAIN_MESH_MAX_ERROR);
}
/** Render mesh surfaces from height map images. */
class TerrainLayer extends CompositeLayer {
    updateState({ props, oldProps }) {
        const elevationDataChanged = props.elevationData !== oldProps.elevationData;
        if (elevationDataChanged) {
            const { elevationData } = props;
            const isTiled = elevationData && (Array.isArray(elevationData) || isTileSetURL(elevationData));
            this.setState({ isTiled });
        }
        // Reloading for single terrain mesh
        const shouldReload = elevationDataChanged ||
            props.meshMaxError !== oldProps.meshMaxError ||
            props.elevationDecoder !== oldProps.elevationDecoder ||
            props.bounds !== oldProps.bounds;
        if (!this.state.isTiled && shouldReload) {
            // When state.isTiled, elevationData cannot be an array
            const terrain = this.loadTerrain(props);
            this.setState({ terrain });
        }
        // TODO - remove in v9
        // @ts-ignore
        if (props.workerUrl) {
            log.removed('workerUrl', 'loadOptions.terrain.workerUrl')();
        }
    }
    loadTerrain({ elevationData, bounds, elevationDecoder, meshMaxError, signal }) {
        if (!elevationData) {
            return null;
        }
        const effectiveMeshMaxError = getEffectiveMeshMaxError(meshMaxError);
        let loadOptions = this.getLoadOptions();
        loadOptions = {
            ...loadOptions,
            terrain: {
                skirtHeight: this.state.isTiled ? effectiveMeshMaxError * 2 : 0,
                ...loadOptions?.terrain,
                bounds,
                meshMaxError: effectiveMeshMaxError,
                elevationDecoder
            }
        };
        const { fetch } = this.props;
        return fetch(elevationData, { propName: 'elevationData', layer: this, loadOptions, signal });
    }
    getTiledTerrainData(tile) {
        const { elevationData, fetch, texture, elevationDecoder, meshMaxError } = this.props;
        const { viewport } = this.context;
        const dataUrl = getURLFromTemplate(elevationData, tile);
        const textureUrl = texture && getURLFromTemplate(texture, tile);
        const { signal } = tile;
        let bottomLeft = [0, 0];
        let topRight = [0, 0];
        if (viewport.isGeospatial) {
            const bbox = tile.bbox;
            bottomLeft = viewport.projectFlat([bbox.west, bbox.south]);
            topRight = viewport.projectFlat([bbox.east, bbox.north]);
        }
        else {
            const bbox = tile.bbox;
            bottomLeft = [bbox.left, bbox.bottom];
            topRight = [bbox.right, bbox.top];
        }
        const bounds = [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]];
        const overlappedBounds = getOverlappedBounds(bounds, this.props.tileSize, viewport instanceof GlobeViewport);
        const terrain = this.loadTerrain({
            elevationData: dataUrl,
            bounds: overlappedBounds,
            elevationDecoder,
            meshMaxError,
            signal
        });
        const surface = textureUrl
            ? // If surface image fails to load, the tile should still be displayed
                fetch(textureUrl, { propName: 'texture', layer: this, loaders: [], signal }).catch(_ => null)
            : Promise.resolve(null);
        return Promise.all([terrain, surface]);
    }
    renderSubLayers(props) {
        const SubLayerClass = this.getSubLayerClass('mesh', SimpleMeshLayer);
        const { color, wireframe, material } = this.props;
        const { data } = props;
        if (!data) {
            return null;
        }
        const [mesh, texture] = data;
        const { viewport } = this.context;
        // Bounds are baked with projectFlat. In GlobeView projectFlat is identity,
        // so tiled terrain meshes are in lng/lat degrees instead of common-space
        // web-mercator units.
        const isGlobe = viewport instanceof GlobeViewport;
        const boundingBox = mesh?.header?.boundingBox;
        const hasLngLatBounds = boundingBox &&
            boundingBox.every(([x, y]) => x >= -MAX_LONGITUDE && x <= MAX_LONGITUDE && y >= -MAX_LATITUDE && y <= MAX_LATITUDE);
        const coordinateSystem = isGlobe && hasLngLatBounds ? COORDINATE_SYSTEM.LNGLAT : COORDINATE_SYSTEM.CARTESIAN;
        return new SubLayerClass(props, {
            data: DUMMY_DATA,
            mesh,
            texture,
            _instanced: false,
            coordinateSystem,
            getPosition: d => [0, 0, 0],
            getColor: color,
            wireframe,
            material
        });
    }
    // Update zRange of viewport
    onViewportLoad(tiles) {
        if (!tiles) {
            return;
        }
        const { zRange } = this.state;
        const ranges = tiles
            .map(tile => tile.content)
            .filter(Boolean)
            .map(arr => {
            // @ts-ignore
            const bounds = arr[0].header.boundingBox;
            return bounds.map(bound => bound[2]);
        });
        if (ranges.length === 0) {
            return;
        }
        const minZ = Math.min(...ranges.map(x => x[0]));
        const maxZ = Math.max(...ranges.map(x => x[1]));
        if (!zRange || minZ < zRange[0] || maxZ > zRange[1]) {
            this.setState({ zRange: [minZ, maxZ] });
        }
    }
    renderLayers() {
        const { color, material, elevationData, texture, wireframe, meshMaxError, elevationDecoder, tileSize, maxZoom, minZoom, extent, maxRequests, onTileLoad, onTileUnload, onTileError, maxCacheSize, maxCacheByteSize, refinementStrategy, zoomOffset } = this.props;
        if (this.state.isTiled) {
            return new TileLayer(this.getSubLayerProps({
                id: 'tiles'
            }), {
                getTileData: this.getTiledTerrainData.bind(this),
                renderSubLayers: this.renderSubLayers.bind(this),
                updateTriggers: {
                    getTileData: {
                        elevationData: urlTemplateToUpdateTrigger(elevationData),
                        texture: urlTemplateToUpdateTrigger(texture),
                        meshMaxError,
                        elevationDecoder,
                        projectionMode: this.context.viewport.projectionMode,
                        zoomOffset
                    }
                },
                onViewportLoad: this.onViewportLoad.bind(this),
                zRange: this.state.zRange || null,
                tileSize,
                maxZoom,
                minZoom,
                extent,
                maxRequests,
                onTileLoad,
                onTileUnload,
                onTileError,
                maxCacheSize,
                maxCacheByteSize,
                refinementStrategy,
                zoomOffset
            });
        }
        if (!elevationData) {
            return null;
        }
        const SubLayerClass = this.getSubLayerClass('mesh', SimpleMeshLayer);
        return new SubLayerClass(this.getSubLayerProps({
            id: 'mesh'
        }), {
            data: DUMMY_DATA,
            mesh: this.state.terrain,
            texture,
            _instanced: false,
            getPosition: d => [0, 0, 0],
            getColor: color,
            material,
            wireframe
        });
    }
}
TerrainLayer.defaultProps = defaultProps;
TerrainLayer.layerName = 'TerrainLayer';
export default TerrainLayer;
const isTileSetURL = (url) => url.includes('{x}') && (url.includes('{y}') || url.includes('{-y}'));
//# sourceMappingURL=terrain-layer.js.map