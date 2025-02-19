// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// CARTO Layers
import {default as ClusterTileLayer} from './layers/cluster-tile-layer';
import {default as H3TileLayer} from './layers/h3-tile-layer';
import {default as HeatmapTileLayer} from './layers/heatmap-tile-layer';
import {default as PointLabelLayer} from './layers/point-label-layer';
import {default as QuadbinTileLayer} from './layers/quadbin-tile-layer';
import {default as RasterTileLayer} from './layers/raster-tile-layer';
import {default as VectorTileLayer} from './layers/vector-tile-layer';

// Exports for playground/bindings
const CARTO_LAYERS = {
  ClusterTileLayer,
  H3TileLayer,
  HeatmapTileLayer,
  PointLabelLayer,
  QuadbinTileLayer,
  RasterTileLayer,
  VectorTileLayer
};
export {
  CARTO_LAYERS,
  ClusterTileLayer,
  H3TileLayer,
  HeatmapTileLayer,
  PointLabelLayer,
  QuadbinTileLayer,
  RasterTileLayer,
  VectorTileLayer
};

// Internal Layers
export {default as _QuadbinLayer} from './layers/quadbin-layer';
export {default as _RasterLayer} from './layers/raster-layer';
export {default as _SpatialIndexTileLayer} from './layers/spatial-index-tile-layer';

// Types
export type {ClusterTileLayerProps} from './layers/cluster-tile-layer';
export type {H3TileLayerProps} from './layers/h3-tile-layer';
export type {HeatmapTileLayerProps} from './layers/heatmap-tile-layer';
export type {PointLabelLayerProps} from './layers/point-label-layer';
export type {QuadbinLayerProps} from './layers/quadbin-layer';
export type {QuadbinTileLayerProps} from './layers/quadbin-tile-layer';
export type {RasterLayerProps} from './layers/raster-layer';
export type {RasterTileLayerProps} from './layers/raster-tile-layer';
export type {SpatialIndexTileLayerProps} from './layers/spatial-index-tile-layer';
export type {VectorTileLayerProps} from './layers/vector-tile-layer';

// Helpers
export {
  default as BASEMAP,
  GOOGLE_BASEMAPS as _GOOGLE_BASEMAPS,
  getStyleUrl as _getStyleUrl,
  fetchStyle as _fetchStyle,
  applyLayerGroupFilters as _applyLayerGroupFilters,
  STYLE_LAYER_GROUPS as _STYLE_LAYER_GROUPS
} from './basemap';
export {default as colorBins} from './style/color-bins-style';
export {default as colorCategories} from './style/color-categories-style';
export {default as colorContinuous} from './style/color-continuous-style';
export {fetchMap} from './api/index';
export {fetchBasemapProps} from './api/basemap';
export type {
  FetchMapOptions,
  FetchMapResult,
  Basemap as _Basemap,
  MapLibreBasemap as _MapLibreBasemap,
  GoogleBasemap as _GoogleBasemap
} from './api/index';

// TODO(v10): Consider removing re-exports from '@carto/api-client' below.

import {
  boundaryQuerySource,
  boundaryTableSource,
  h3QuerySource,
  h3TableSource,
  h3TilesetSource,
  rasterSource,
  quadbinQuerySource,
  quadbinTableSource,
  quadbinTilesetSource,
  vectorQuerySource,
  vectorTableSource,
  vectorTilesetSource
} from '@carto/api-client';

export const CARTO_SOURCES = {
  boundaryQuerySource,
  boundaryTableSource,
  h3QuerySource,
  h3TableSource,
  h3TilesetSource,
  rasterSource,
  quadbinQuerySource,
  quadbinTableSource,
  quadbinTilesetSource,
  vectorQuerySource,
  vectorTableSource,
  vectorTilesetSource
};

export {
  boundaryQuerySource,
  boundaryTableSource,
  h3QuerySource,
  h3TableSource,
  h3TilesetSource,
  rasterSource,
  quadbinQuerySource,
  quadbinTableSource,
  quadbinTilesetSource,
  vectorQuerySource,
  vectorTableSource,
  vectorTilesetSource,
  query,
  CartoAPIError,
  SOURCE_DEFAULTS
} from '@carto/api-client';

export type {
  GeojsonResult,
  JsonResult,
  TilejsonResult,
  SourceOptions,
  QuerySourceOptions,
  TableSourceOptions,
  TilesetSourceOptions,
  BoundaryQuerySourceOptions,
  BoundaryTableSourceOptions,
  H3QuerySourceOptions,
  H3TableSourceOptions,
  H3TilesetSourceOptions,
  RasterSourceOptions,
  QuadbinQuerySourceOptions,
  QuadbinTableSourceOptions,
  QuadbinTilesetSourceOptions,
  VectorQuerySourceOptions,
  VectorTableSourceOptions,
  VectorTilesetSourceOptions,
  QueryParameters
} from '@carto/api-client';
