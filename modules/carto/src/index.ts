export {getDefaultCredentials, setDefaultCredentials} from './config';
export {default as CartoLayer} from './layers/carto-layer'; // <-- REMOVE in v9
export {default as VectorTileLayer} from './layers/vector-tile-layer';
export {default as H3TileLayer} from './layers/h3-tile-layer';
export {default as _PointLabelLayer} from './layers/point-label-layer';
export {default as QuadbinTileLayer} from './layers/quadbin-tile-layer';
export {default as RasterTileLayer} from './layers/raster-tile-layer';
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
  SOURCE_DEFAULTS
} from './sources';
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
