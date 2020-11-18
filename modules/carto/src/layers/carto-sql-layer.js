import CartoLayer from './carto-layer';
import {getMapsVersion} from '../config';

const defaultProps = {
  bufferSize: 16, // MVT buffersize in pixels,
  tileExtent: 4096, // Tile extent in tile coordinate space (MVT spec.)
  uniqueIdProperty: 'cartodb_id'
};

export default class CartoSQLLayer extends CartoLayer {
  buildMapConfig() {
    const {data, bufferSize, tileExtent} = this.props;

    const version = getMapsVersion(this.props.creds);
    const isSQL = data.search(' ') > -1;
    const sql = isSQL ? data : `SELECT * FROM ${data}`;

    switch (version) {
      case 'v1':
        // Map config v1
        return {
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

      case 'v2':
        // Map config v2
        return {
          version: '2.0.0',
          buffer_size: bufferSize,
          tile_extent: tileExtent,
          layers: [
            {
              type: 'sql',
              source: 'postgres',
              options: {
                sql: sql.trim(),
                vector_extent: tileExtent
              }
            }
          ]
        };
      default:
        throw new Error(`Cannot build MapConfig for unmatching version ${version}`);
    }
  }
}

CartoSQLLayer.layerName = 'CartoSQLLayer';
CartoSQLLayer.defaultProps = defaultProps;
