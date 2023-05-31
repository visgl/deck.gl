import {LoaderOptions, LoaderWithParser} from '@loaders.gl/loader-utils';

import {Tile, TileReader} from './carto-spatial-tile';
import {parsePbf} from './tile-loader-utils';
import {IndexScheme, binaryToSpatialjson, SpatialJson} from './spatialjson-utils';

const CartoSpatialTileLoader: LoaderWithParser = {
  name: 'CARTO Spatial Tile',
  version: '1',
  id: 'cartoSpatialTile',
  module: 'carto',
  extensions: ['pbf'],
  mimeTypes: ['application/vnd.carto-spatial-tile'],
  category: 'geometry',
  worker: false,
  parse: async (arrayBuffer, options) => parseCartoSpatialTile(arrayBuffer, options),
  parseSync: parseCartoSpatialTile,
  options: {
    cartoSpatialTile: {
      scheme: 'quadbin'
    } as {scheme: IndexScheme}
  }
};

function parseCartoSpatialTile(
  arrayBuffer: ArrayBuffer,
  options?: LoaderOptions
): SpatialJson | null {
  if (!arrayBuffer) return null;
  const tile: Tile = parsePbf(arrayBuffer, TileReader);

  const {cells} = tile;
  // @ts-expect-error
  const scheme = options?.cartoSpatialTile?.scheme;
  const data = {cells, scheme};

  return binaryToSpatialjson(data);
}

export default CartoSpatialTileLoader;
