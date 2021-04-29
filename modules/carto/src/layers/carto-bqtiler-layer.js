import CartoLayer from './carto-layer';
import {PROVIDERS, MAP_TYPES} from '../api/maps-api-client';

const defaultProps = {
  mode: 'carto',
  provider: PROVIDERS.BIGQUERY,
  type: MAP_TYPES.TILESET
};

export default class CartoBQTilerLayer extends CartoLayer {}

CartoBQTilerLayer.layerName = 'CartoBQTilerLayer';
CartoBQTilerLayer.defaultProps = defaultProps;