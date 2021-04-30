import {log} from '@deck.gl/core';
import CartoLayer from './carto-layer';
import {MAP_TYPES} from '../api';

const defaultProps = {
  ...CartoLayer.defaultProps,
  type: MAP_TYPES.SQL,
  uniqueIdProperty: 'cartodb_id'
};

export default class CartoSQLLayer extends CartoLayer {
  constructor(...args) {
    super(...args);

    log.warn(
      `CartoSQLLayer will be removed in future versions. Use CartoLayer with type='${
        MAP_TYPES.SQL
      }' and apiVersion='v2'`
    )();
  }
}

CartoSQLLayer.layerName = 'CartoSQLLayer';
CartoSQLLayer.defaultProps = defaultProps;
