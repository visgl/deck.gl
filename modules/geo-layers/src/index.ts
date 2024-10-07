// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable max-len */

export {WMSLayer as _WMSLayer} from './wms-layer/wms-layer';
export {default as GreatCircleLayer} from './great-circle-layer/great-circle-layer';
export {default as S2Layer} from './s2-layer/s2-layer';
export {default as QuadkeyLayer} from './quadkey-layer/quadkey-layer';
export {default as TileLayer} from './tile-layer/tile-layer';
export {default as TripsLayer} from './trips-layer/trips-layer';
export {default as H3ClusterLayer} from './h3-layers/h3-cluster-layer';
export {default as H3HexagonLayer} from './h3-layers/h3-hexagon-layer';
export {default as Tile3DLayer} from './tile-3d-layer/tile-3d-layer';
export {default as TerrainLayer} from './terrain-layer/terrain-layer';
export {default as MVTLayer} from './mvt-layer/mvt-layer';
export {default as GeohashLayer} from './geohash-layer/geohash-layer';

export {default as _GeoCellLayer} from './geo-cell-layer/GeoCellLayer';

// Types
export type {WMSLayerProps} from './wms-layer/wms-layer';
export type {H3ClusterLayerProps} from './h3-layers/h3-cluster-layer';
export type {H3HexagonLayerProps} from './h3-layers/h3-hexagon-layer';
export type {GreatCircleLayerProps} from './great-circle-layer/great-circle-layer';
export type {S2LayerProps} from './s2-layer/s2-layer';
export type {TileLayerProps, TileLayerPickingInfo} from './tile-layer/tile-layer';
export type {TripsLayerProps} from './trips-layer/trips-layer';
export type {QuadkeyLayerProps} from './quadkey-layer/quadkey-layer';
export type {TerrainLayerProps} from './terrain-layer/terrain-layer';
export type {Tile3DLayerProps} from './tile-3d-layer/tile-3d-layer';
export type {MVTLayerProps, MVTLayerPickingInfo} from './mvt-layer/mvt-layer';
export type {GeoCellLayerProps as _GeoCellLayerProps} from './geo-cell-layer/GeoCellLayer';
export type {GeohashLayerProps} from './geohash-layer/geohash-layer';

// Tileset2D

export type {GeoBoundingBox, NonGeoBoundingBox} from './tileset-2d/index';
export type {TileLoadProps as _TileLoadProps} from './tileset-2d/index';

export {getURLFromTemplate as _getURLFromTemplate} from './tileset-2d/index';
export {Tileset2D as _Tileset2D} from './tileset-2d/index';
export {Tile2DHeader as _Tile2DHeader} from './tileset-2d/index';
