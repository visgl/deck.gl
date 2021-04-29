import CartoLayer from './carto-layer';
import {PROVIDERS, MODE, MAP_TYPES} from '../api/maps-api-client';

const defaultProps = {
  ...CartoLayer.defaultProps,
  mode: MODE.CARTO,
  type: MAP_TYPES.TILESET
};

export default class CartoBQTilerLayer extends CartoLayer {}

CartoBQTilerLayer.layerName = 'CartoBQTilerLayer';
CartoBQTilerLayer.defaultProps = defaultProps;