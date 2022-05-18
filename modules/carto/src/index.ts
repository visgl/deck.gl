export {getDefaultCredentials, setDefaultCredentials} from './config';
export {default as CartoLayer} from './layers/carto-layer';
export {default as _CartoTileLayer} from './layers/carto-tile-layer';
export {default as BASEMAP} from './basemap';
export {default as colorBins} from './style/color-bins-style';
export {default as colorCategories} from './style/color-categories-style';
export {default as colorContinuous} from './style/color-continuous-style';
export {
  FORMATS,
  TILE_FORMATS,
  MAP_TYPES,
  API_VERSIONS,
  fetchLayerData,
  fetchMap,
  getDataV2 as _getDataV2,
  getData,
  mapInstantiation as _mapInstantiation
} from './api';

export type {CartoLayerProps} from './layers/carto-layer';
