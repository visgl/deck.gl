import CartoLayer from './carto-layer';
import {getMapsVersion} from '../config';
import {getTileJSON, CONNECTIONS, MAP_TYPES} from '../api/maps-api-client';

const defaultProps = {
  bufferSize: 16, // MVT buffersize in pixels,
  tileExtent: 4096, // Tile extent in tile coordinate space (MVT spec.)
  uniqueIdProperty: 'cartodb_id'
};

export default class CartoSQLLayer extends CartoLayer {
  async updateTileJSON() {
    const {data, bufferSize, tileExtent, credentials} = this.props;
    const version = getMapsVersion(credentials);
    const isSQL = data.search(' ') > -1;

    switch (version) {
      case 'v1':
        const sql = isSQL ? data : `SELECT * FROM ${data}`;

        // Map config v1
        const mapConfig = {
          version: '1.3.1',
          buffersize: {
            mvt: bufferSize
          },
          layers: [
            {
              type: 'mapnik',
              options: {
                sql: sql.trim(),
                vector_extent: tileExtent
              }
            }
          ]
        };

        return await getTileJSON({mapConfig, credentials});

      case 'v2':
        return await getTileJSON({
          connection: CONNECTIONS.CARTO,
          source: data,
          type: isSQL ? MAP_TYPES.SQL : MAP_TYPES.TABLE,
          credentials
        });

      default:
        throw new Error(`Cannot build MapConfig for unmatching version ${version}`);
    }
  }
}

CartoSQLLayer.layerName = 'CartoSQLLayer';
CartoSQLLayer.defaultProps = defaultProps;
