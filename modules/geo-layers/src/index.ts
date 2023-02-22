// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
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
export type {TileLayerProps} from './tile-layer/tile-layer';
export type {QuadkeyLayerProps} from './quadkey-layer/quadkey-layer';
export type {TerrainLayerProps} from './terrain-layer/terrain-layer';
export type {Tile3DLayerProps} from './tile-3d-layer/tile-3d-layer';
export type {MVTLayerProps} from './mvt-layer/mvt-layer';
export type {GeoCellLayerProps as _GeoCellLayerProps} from './geo-cell-layer/GeoCellLayer';

// Tileset2D

export type {GeoBoundingBox, NonGeoBoundingBox} from './tileset-2d';
export type {TileLoadProps as _TileLoadProps} from './tileset-2d';

export {getURLFromTemplate as _getURLFromTemplate} from './tileset-2d';
export {Tileset2D as _Tileset2D} from './tileset-2d';
export {Tile2DHeader as _Tile2DHeader} from './tileset-2d';
