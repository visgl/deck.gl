import CartoLayer from './carto-layer';
import {getTileJSON, CONNECTIONS, MAP_TYPES} from '../api/maps-api-client';

export default class CartoBQTilerLayer extends CartoLayer {
  async updateTileJSON() {
    const {credentials, data} = this.props;

    return await getTileJSON({
      connection: CONNECTIONS.BIGQUERY,
      type: MAP_TYPES.TILESET,
      source: data,
      credentials
    });
  }
}

CartoBQTilerLayer.layerName = 'CartoBQTilerLayer';
