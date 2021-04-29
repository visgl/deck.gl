import CartoLayer from './carto-layer';
import {getMapsVersion} from '../config';
import {getTileJSON, CONNECTIONS, MODE, MAP_TYPES} from '../api/maps-api-client';

const defaultProps = {
  ...CartoLayer.defaultProps,
  mode: MODE.CARTO,
  type: MAP_TYPES.SQL,
  bufferSize: 16, // MVT buffersize in pixels,
  tileExtent: 4096, // Tile extent in tile coordinate space (MVT spec.)
  uniqueIdProperty: 'cartodb_id'
};

export default class CartoSQLLayer extends CartoLayer {}

CartoSQLLayer.layerName = 'CartoSQLLayer';
CartoSQLLayer.defaultProps = defaultProps;