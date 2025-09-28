// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable max-len */

// Core Layers
export {default as ArcLayer} from './arc-layer/arc-layer';
export {default as BitmapLayer} from './bitmap-layer/bitmap-layer';
export {default as IconLayer} from './icon-layer/icon-layer';
export {default as LineLayer} from './line-layer/line-layer';
export {default as PointCloudLayer} from './point-cloud-layer/point-cloud-layer';
export {default as ScatterplotLayer} from './scatterplot-layer/scatterplot-layer';
export {default as ColumnLayer} from './column-layer/column-layer';
export {default as GridCellLayer} from './column-layer/grid-cell-layer';
export {default as PathLayer} from './path-layer/path-layer';
export {default as PolygonLayer} from './polygon-layer/polygon-layer';
export {default as GeoJsonLayer} from './geojson-layer/geojson-layer';
export {default as TextLayer} from './text-layer/text-layer';
export {default as SolidPolygonLayer} from './solid-polygon-layer/solid-polygon-layer';

// Experimental layer exports
export {default as _MultiIconLayer} from './text-layer/multi-icon-layer/multi-icon-layer';
export {default as _TextBackgroundLayer} from './text-layer/text-background-layer/text-background-layer';

// Types
export type {ArcLayerProps} from './arc-layer/arc-layer';
export type {
  BitmapLayerProps,
  BitmapBoundingBox,
  BitmapLayerPickingInfo
} from './bitmap-layer/bitmap-layer';
export type {ColumnLayerProps} from './column-layer/column-layer';
export type {ScatterplotLayerProps} from './scatterplot-layer/scatterplot-layer';
export type {IconLayerProps} from './icon-layer/icon-layer';
export type {LineLayerProps} from './line-layer/line-layer';
export type {PolygonLayerProps} from './polygon-layer/polygon-layer';
export type {GeoJsonLayerProps} from './geojson-layer/geojson-layer';
export type {GridCellLayerProps} from './column-layer/grid-cell-layer';
export type {TextLayerProps} from './text-layer/text-layer';
export type {MultiIconLayerProps} from './text-layer/multi-icon-layer/multi-icon-layer';
export type {PointCloudLayerProps} from './point-cloud-layer/point-cloud-layer';
export type {TextBackgroundLayerProps} from './text-layer/text-background-layer/text-background-layer';
export type {PathLayerProps} from './path-layer/path-layer';
export type {SolidPolygonLayerProps} from './solid-polygon-layer/solid-polygon-layer';
