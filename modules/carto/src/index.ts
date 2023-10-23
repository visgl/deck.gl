export {getDefaultCredentials, setDefaultCredentials} from './config';
export {default as CartoLayer} from './layers/carto-layer'; // <-- REMOVE in v9
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
export {
  FORMATS,
  TILE_FORMATS,
  MAP_TYPES,
  API_VERSIONS,
  CartoAPIError,
  fetchLayerData,
  fetchMap,
  getDataV2 as _getDataV2,
  mapInstantiation as _mapInstantiation
} from './api';
export type {APIErrorContext, QueryParameters} from './api';
export type {CartoLayerProps} from './layers/carto-layer';

import {
  cartoH3QuerySource,
  cartoH3TableSource,
  cartoH3TilesetSource,
  cartoRasterSource,
  cartoQuadbinQuerySource,
  cartoQuadbinTableSource,
  cartoQuadbinTilesetSource,
  cartoVectorQuerySource,
  cartoVectorTableSource,
  cartoVectorTilesetSource,
  SOURCE_DEFAULTS
} from './sources';

const CARTO_SOURCES = {
  cartoH3QuerySource,
  cartoH3TableSource,
  cartoH3TilesetSource,
  cartoRasterSource,
  cartoQuadbinQuerySource,
  cartoQuadbinTableSource,
  cartoQuadbinTilesetSource,
  cartoVectorQuerySource,
  cartoVectorTableSource,
  cartoVectorTilesetSource
};

export {
  cartoH3QuerySource,
  cartoH3TableSource,
  cartoH3TilesetSource,
  cartoRasterSource,
  cartoQuadbinQuerySource,
  cartoQuadbinTableSource,
  cartoQuadbinTilesetSource,
  cartoVectorQuerySource,
  cartoVectorTableSource,
  cartoVectorTilesetSource,
  CARTO_SOURCES,
  SOURCE_DEFAULTS
};

export type {
  CartoTilejsonResult,
  CartoH3QuerySourceOptions,
  CartoH3TableSourceOptions,
  CartoH3TilesetSourceOptions,
  CartoRasterSourceOptions,
  CartoQuadbinQuerySourceOptions,
  CartoQuadbinTableSourceOptions,
  CartoQuadbinTilesetSourceOptions,
  CartoVectorQuerySourceOptions,
  CartoVectorTableSourceOptions,
  CartoVectorTilesetSourceOptions,
  GeojsonResult,
  JsonResult
} from './sources';
