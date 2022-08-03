import Protobuf from 'pbf';
import {LoaderOptions, LoaderWithParser} from '@loaders.gl/loader-utils';

import {TILE_FORMATS} from '../../api/maps-api-common';
import {KeyValueProperties} from './carto-tile';
import {binaryToSpatialjson, Properties, SpatialJson} from './spatialjson-utils';
import {Tile, TileReader} from './carto-spatial-tile';

const CartoSpatialTileLoader: LoaderWithParser = {
  name: 'CARTO Spatial Tile',
  version: '1',
  id: 'cartoSpatialTile',
  module: 'carto',
  extensions: ['pbf'],
  mimeTypes: ['application/x-protobuf'],
  category: 'geometry',
  worker: false,
  parse: async (arrayBuffer, options) => parseCartoSpatialTile(arrayBuffer, options),
  parseSync: parseCartoSpatialTile,
  options: {}
};

function parsePbf(buffer: ArrayBuffer): Tile {
  const pbf = new Protobuf(buffer);
  const tile = TileReader.read(pbf);
  return tile;
}

function unpackProperties(properties: KeyValueProperties[]): Properties[] {
  if (!properties || !properties.length) {
    return [];
  }
  return properties.map(item => {
    const currentRecord: Properties = {};
    item.data.forEach(({key, value}) => {
      currentRecord[key] = value;
    });
    return currentRecord;
  });
}

function parseCartoSpatialTile(
  arrayBuffer: ArrayBuffer,
  options?: LoaderOptions
): SpatialJson | null {
  if (!arrayBuffer) return null;
  const tile = parsePbf(arrayBuffer);

  const {cells} = tile;
  const data = {
    cells: {...cells, properties: unpackProperties(cells.properties)}
  };

  return binaryToSpatialjson(data);
}

export default CartoSpatialTileLoader;
