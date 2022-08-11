import Protobuf from 'pbf';
import {LoaderOptions, LoaderWithParser} from '@loaders.gl/loader-utils';
import type {BinaryFeatures} from '@loaders.gl/schema';

import {KeyValueProperties, Tile, TileReader} from './carto-tile';

// TODO move type into shared file?
import {Properties} from './spatialjson-utils';

const CartoVectorTileLoader: LoaderWithParser = {
  name: 'CARTO Vector Tile',
  version: '1',
  id: 'cartoVectorTile',
  module: 'carto',
  extensions: ['pbf'],
  mimeTypes: ['application/vnd.carto-vector-tile'],
  category: 'geometry',
  worker: false,
  parse: async (arrayBuffer, options) => parseCartoVectorTile(arrayBuffer, options),
  parseSync: parseCartoVectorTile,
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

function parseCartoVectorTile(
  arrayBuffer: ArrayBuffer,
  options?: LoaderOptions
): BinaryFeatures | null {
  if (!arrayBuffer) return null;
  const tile = parsePbf(arrayBuffer);

  const {points, lines, polygons} = tile;
  const data = {
    points: {...points, properties: unpackProperties(points.properties)},
    lines: {...lines, properties: unpackProperties(lines.properties)},
    polygons: {...polygons, properties: unpackProperties(polygons.properties)}
  };

  // Note: there is slight, difference in `numericProps` type, however geojson/mvtlayer can cope with this
  return data as unknown as BinaryFeatures;
}

export default CartoVectorTileLoader;
