export {getDefaultCredentials, setDefaultCredentials} from './config.js';
export {default as CartoSQLLayer} from './layers/carto-sql-layer';
export {default as CartoBQTilerLayer} from './layers/carto-bqtiler-layer';
export {default as CartoLayer} from './layers/carto-layer';
export {default as BASEMAP} from './basemap';
export {default as colorBins} from './style/color-bins-style';
export {default as colorCategories} from './style/color-categories-style';
export {default as colorContinuous} from './style/color-continuous-style';
// export {getTileJSON as _getTileJSON} from './api/maps-api-client';
export {
  FORMATS,
  MAP_TYPES,
  API_VERSIONS,
  getDataV1 as _getDataV1,
  getData,
  getMapMetadata as _getMapMetadata
} from './api';
