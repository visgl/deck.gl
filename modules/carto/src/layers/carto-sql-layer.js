import {log} from '@deck.gl/core';
import CartoLayer from './carto-layer';
import {MODES, MAP_TYPES} from '../api';

const defaultProps = {
  ...CartoLayer.defaultProps,
  mode: MODES.CARTO,
  type: MAP_TYPES.SQL,
  uniqueIdProperty: 'cartodb_id'
};

export default class CartoSQLLayer extends CartoLayer {
  constructor(...args) {
    super(...args);

    log.warn(
      `CartoSQLLayer will be removed in future versions. Use CartoLayer with mode='${
        MODES.CARTO
      }' and type='${MAP_TYPES.SQL}'`
    )();
  }
}

CartoSQLLayer.layerName = 'CartoSQLLayer';
CartoSQLLayer.defaultProps = defaultProps;
