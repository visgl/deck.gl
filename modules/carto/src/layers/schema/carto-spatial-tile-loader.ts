import {LoaderOptions, LoaderWithParser} from '@loaders.gl/loader-utils';

import {Tile, TileReader} from './carto-spatial-tile';
import {parsePbf} from './tile-loader-utils';
import {getWorkerUrl} from '../../utils';
import {IndexScheme, binaryToSpatialjson, SpatialJson} from './spatialjson-utils';

const VERSION = typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'latest';
const id = 'cartoSpatialTile';

type CartoSpatialTileLoaderOptions = LoaderOptions & {
  cartoSpatialTile?: {
    scheme: IndexScheme;
    workerUrl: string;
  };
};

const DEFAULT_OPTIONS: CartoSpatialTileLoaderOptions = {
  cartoSpatialTile: {
    scheme: 'quadbin',
    workerUrl: getWorkerUrl(id, VERSION)
  }
};

const CartoSpatialTileLoader: LoaderWithParser = {
  name: 'CARTO Spatial Tile',
  version: VERSION,
  id,
  module: 'carto',
  extensions: ['pbf'],
  mimeTypes: ['application/vnd.carto-spatial-tile'],
  category: 'geometry',
  parse: async (arrayBuffer, options?: CartoSpatialTileLoaderOptions) =>
    parseCartoSpatialTile(arrayBuffer, options),
  parseSync: parseCartoSpatialTile,
  worker: false, // TODO set to true once workers deployed to unpkg
  options: DEFAULT_OPTIONS
};

function parseCartoSpatialTile(
  arrayBuffer: ArrayBuffer,
  options?: CartoSpatialTileLoaderOptions
): SpatialJson | null {
  if (!arrayBuffer) return null;
  const tile: Tile = parsePbf(arrayBuffer, TileReader);

  const {cells} = tile;
  const scheme = options?.cartoSpatialTile?.scheme;
  const data = {cells, scheme};

  return binaryToSpatialjson(data);
}

export default CartoSpatialTileLoader;
