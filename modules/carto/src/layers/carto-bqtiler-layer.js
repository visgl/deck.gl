import CartoLayer from './carto-layer';
import {MODE,MAP_TYPES} from '../api/maps-api-common';
import {CONNECTIONS} from '../api/maps-classic-client';

const defaultProps = {
  ...CartoLayer.defaultProps,
  mode: MODE.CARTO,
  type: MAP_TYPES.TILESET,
  connection: CONNECTIONS.BIGQUERY
};

export default class CartoBQTilerLayer extends CartoLayer {}

CartoBQTilerLayer.layerName = 'CartoBQTilerLayer';
CartoBQTilerLayer.defaultProps = defaultProps;