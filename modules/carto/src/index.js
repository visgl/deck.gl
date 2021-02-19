export {
  getDefaultCredentials,
  setDefaultCredentials,
  getMapsVersion as _getMapsVersion
} from './config.js';
export {default as CartoSQLLayer} from './layers/carto-sql-layer';
export {default as CartoBQTilerLayer} from './layers/carto-bqtiler-layer';
export {default as BASEMAP} from './basemap';
export {default as colorBins} from './style/color-bins-style';
export {default as colorCategories} from './style/color-categories-style';
export {default as colorContinuous} from './style/color-continuous-style';
export {getTileJSON as _getTileJSON} from './api/maps-api-client';
