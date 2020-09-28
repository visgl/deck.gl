import CartoLayer from './carto-layer';
import {getMapTileJSON} from '../api/maps-api-client';

const defaultProps = {
  version: '1.3.1', // MapConfig Version (Maps API)
  bufferSize: 1, // MVT buffersize in pixels,
  tileExtent: 4096, // Tile extent in tile coordinate space (MVT spec.)
  uniqueIdProperty: 'cartodb_id'
};

export default class CartoSQLLayer extends CartoLayer {
  async _updateTileJSON() {
    const tilejson = await getMapTileJSON(this.props);
    this.setState({tilejson});
  }
}

CartoSQLLayer.layerName = 'CartoSQLLayer';
CartoSQLLayer.defaultProps = defaultProps;
