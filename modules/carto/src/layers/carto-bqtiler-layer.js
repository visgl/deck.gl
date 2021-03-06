import CartoLayer from './carto-layer';
import {CONNECTIONS, MAP_TYPES} from '../api/maps-api-client';

const defaultProps = {
  connection: CONNECTIONS.BIGQUERY,
  type: MAP_TYPES.TILESET
};

export default class CartoBQTilerLayer extends CartoLayer {
  
}

CartoBQTilerLayer.layerName = 'CartoBQTilerLayer';
CartoBQTilerLayer.defaultProps = defaultProps;

