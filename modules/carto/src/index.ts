import {default as H3TileLayer} from './layers/h3-tile-layer';
import {default as _PointLabelLayer} from './layers/point-label-layer';
import {default as QuadbinTileLayer} from './layers/quadbin-tile-layer';
import {default as RasterTileLayer} from './layers/raster-tile-layer';
import {default as VectorTileLayer} from './layers/vector-tile-layer';
const CARTO_LAYERS = {
  H3TileLayer,
  _PointLabelLayer,
  QuadbinTileLayer,
  RasterTileLayer,
  VectorTileLayer
};
export {
  CARTO_LAYERS,
  H3TileLayer,
  _PointLabelLayer,
  QuadbinTileLayer,
  RasterTileLayer,
  VectorTileLayer
};

export {default as BASEMAP} from './basemap';
export {default as colorBins} from './style/color-bins-style';
export {default as colorCategories} from './style/color-categories-style';
export {default as colorContinuous} from './style/color-continuous-style';
export {CartoAPIError, fetchMap, query} from './api';
export type {
  APIErrorContext,
  FetchMapOptions,
  Format,
  MapType,
  RequestType,
  QueryParameters,
  QueryOptions
} from './api';

import {
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
  SOURCE_DEFAULTS
} from './sources';

const CARTO_SOURCES = {
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
  CARTO_SOURCES,
  SOURCE_DEFAULTS
};

export type {
  TilejsonResult,
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
  GeojsonResult,
  JsonResult
} from './sources';
