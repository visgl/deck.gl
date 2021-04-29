import {log} from '@deck.gl/core';
import CartoLayer from './carto-layer';
import {MODES, MAP_TYPES} from '../api';

const defaultProps = {
  ...CartoLayer.defaultProps,
  mode: MODES.CARTO,
  type: MAP_TYPES.TILESET
};

export default class CartoBQTilerLayer extends CartoLayer {
  constructor(...args) {
    super(...args);

    log.warn(
      `CartoBQTilerLayer will be removed in future versions. Use CartoLayer with mode='${
        MODES.CARTO
      }' and type='${MAP_TYPES.TILESET}'`
    )();
  }
}

CartoBQTilerLayer.layerName = 'CartoBQTilerLayer';
CartoBQTilerLayer.defaultProps = defaultProps;
