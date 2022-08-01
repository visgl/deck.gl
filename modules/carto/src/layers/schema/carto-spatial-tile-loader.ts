import Protobuf from 'pbf';
import {LoaderOptions, LoaderWithParser} from '@loaders.gl/loader-utils';
import type {BinaryFeatures} from '@loaders.gl/schema';

import {TILE_FORMATS} from '../../api/maps-api-common';
import {Properties} from './carto-tile';
import {binaryToTile, tileToBinary, Tile, TileReader} from './carto-spatial-tile';

const defaultTileFormat = TILE_FORMATS.BINARY;

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
  options: {
    cartoSpatialTile: {
      formatTiles: defaultTileFormat
    }
  }
};

function parsePbf(buffer: ArrayBuffer): Tile {
  const pbf = new Protobuf(buffer);
  const tile = TileReader.read(pbf);
  return tile;
}

function unpackProperties(properties: Properties[]) {
  if (!properties || !properties.length) {
    return [];
  }
  return properties.map(item => {
    const currentRecord: Record<string, unknown> = {};
    item.data.forEach(({key, value}) => {
      currentRecord[key] = value;
    });
    return currentRecord;
  });
}

function parseCartoSpatialTile(arrayBuffer: ArrayBuffer, options?: LoaderOptions) {
  if (!arrayBuffer) return null;
  const formatTiles = options && options.cartoTile && options.cartoTile.formatTiles;
  // if (formatTiles === TILE_FORMATS.JSON) return geojsonToBinary(parseJSON(arrayBuffer).features);

  const tile = parsePbf(arrayBuffer);

  const {cells} = tile;
  const data = {
    cells: {...cells, properties: unpackProperties(cells.properties)}
  };

  return data;
}
