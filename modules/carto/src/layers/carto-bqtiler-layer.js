import {log} from '@deck.gl/core';
import CartoLayer from './carto-layer';
import {MODE, MAP_TYPES} from '../api';
import {CONNECTIONS} from '../api/maps-client';

const defaultProps = {
  ...CartoLayer.defaultProps,
  mode: MODE.CARTO,
  type: MAP_TYPES.TILESET,
  connection: CONNECTIONS.BIGQUERY
};

export default class CartoBQTilerLayer extends CartoLayer {
  constructor(...args) {
    super(...args);

    log.warn(
      'CARTO warning: CartoBQTilerLayer will be removed in the following deck.gl versions, and they are not recommended to use. Use CartoLayer instead.'
    )();
  }
}

CartoBQTilerLayer.layerName = 'CartoBQTilerLayer';
CartoBQTilerLayer.defaultProps = defaultProps;