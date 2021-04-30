import {log} from '@deck.gl/core';
import CartoLayer from './carto-layer';
import {API_VERSIONS, MAP_TYPES} from '../api';

const defaultProps = {
  ...CartoLayer.defaultProps,
  apiVersion: API_VERSIONS.V2,
  type: MAP_TYPES.TILESET
};

export default class CartoBQTilerLayer extends CartoLayer {
  constructor(...args) {
    super(...args);

    log.warn(
      `CartoBQTilerLayer will be removed in future versions. Use CartoLayer with apiVersion='v2' and type='${MAP_TYPES.TILESET}'`
    )();
  }
}

CartoBQTilerLayer.layerName = 'CartoBQTilerLayer';
CartoBQTilerLayer.defaultProps = defaultProps;
