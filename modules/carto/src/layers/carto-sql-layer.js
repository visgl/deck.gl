import {log} from '@deck.gl/core';
import CartoLayer from './carto-layer';
import {API_VERSIONS, MAP_TYPES} from '../api';

const defaultProps = {
  ...CartoLayer.defaultProps,
  apiVersion: API_VERSIONS.V2,
  type: MAP_TYPES.SQL,
  uniqueIdProperty: 'cartodb_id'
};

export default class CartoSQLLayer extends CartoLayer {
  constructor(...args) {
    super(...args);

    log.warn(
      `CartoSQLLayer will be removed in future versions. Use CartoLayer with apiVersion='v2' and type='${MAP_TYPES.SQL}'`
    )();
  }
}

CartoSQLLayer.layerName = 'CartoSQLLayer';
CartoSQLLayer.defaultProps = defaultProps;
