import CartoLayer from './carto-layer';
import {getMapTileJSON} from '../api/maps-api-client';

const defaultProps = {
  version: '2.0.0', // MapConfig Version (Maps API)
  bufferSize: 1, // MVT buffersize in pixels,
  tileExtent: 4096, // Tile extent in tile coordinate space (MVT spec.)
  uniqueIdProperty: 'cartodb_id',
};

export default class CartoSQLLayer extends CartoLayer {
  async _updateTileJSON() {
    const tilejson = await getMapTileJSON(this.props);
    return tilejson;
  }
}

CartoSQLLayer.layerName = 'CartoSQLLayer';
CartoSQLLayer.defaultProps = defaultProps;
