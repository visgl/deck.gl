import {log} from '@deck.gl/core';
import CartoLayer from './carto-layer';
import {MAP_TYPES} from '../api';

const defaultProps = {
  ...CartoLayer.defaultProps,
  type: MAP_TYPES.TILESET
};

export default class CartoBQTilerLayer extends CartoLayer {
  constructor(...args) {
    super(...args);

    log.warn(
      'CartoBQTilerLayer will be removed in future versions. Use CartoLayer with type=MAP_TYPES.TILESET and apiVersion=API_VERSIONS.V2'
    )();
  }
}

CartoBQTilerLayer.layerName = 'CartoBQTilerLayer';
CartoBQTilerLayer.defaultProps = defaultProps;
