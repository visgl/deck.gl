import CartoLayer from './carto-layer';
import {MODE ,MAP_TYPES} from '../api/maps-api-common';
import {CONNECTIONS} from '../api/maps-classic-client';

const defaultProps = {
  ...CartoLayer.defaultProps,
  mode: MODE.CARTO,
  connection: CONNECTIONS.CARTO,
  type: MAP_TYPES.SQL,
  uniqueIdProperty: 'cartodb_id'
};

export default class CartoSQLLayer extends CartoLayer {}

CartoSQLLayer.layerName = 'CartoSQLLayer';
CartoSQLLayer.defaultProps = defaultProps;