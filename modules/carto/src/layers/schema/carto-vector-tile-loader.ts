import {LoaderOptions, LoaderWithParser} from '@loaders.gl/loader-utils';
import type {BinaryFeatures} from '@loaders.gl/schema';

import {TileReader} from './carto-tile';
import {parsePbf} from './tile-loader-utils';
import {getWorkerUrl} from '../../utils';

const VERSION = typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'latest';
const id = 'cartoVectorTile';

type CartoVectorTileLoaderOptions = LoaderOptions & {
  cartoVectorTile?: {
    workerUrl: string;
  };
};

const DEFAULT_OPTIONS: CartoVectorTileLoaderOptions = {
  cartoVectorTile: {
    workerUrl: getWorkerUrl(id, VERSION)
  }
};

const CartoVectorTileLoader: LoaderWithParser = {
  name: 'CARTO Vector Tile',
  version: VERSION,
  id,
  module: 'carto',
  extensions: ['pbf'],
  mimeTypes: ['application/vnd.carto-vector-tile'],
  category: 'geometry',
  parse: async (arrayBuffer, options?: CartoVectorTileLoaderOptions) =>
    parseCartoVectorTile(arrayBuffer, options),
  parseSync: parseCartoVectorTile,
  worker: false, // TODO set to true once workers deployed to unpkg
  options: DEFAULT_OPTIONS
};

function parseCartoVectorTile(
  arrayBuffer: ArrayBuffer,
  options?: CartoVectorTileLoaderOptions
): BinaryFeatures | null {
  if (!arrayBuffer) return null;
  const tile = parsePbf(arrayBuffer, TileReader);

  // Note: there is slight, difference in `numericProps` type, however geojson/mvtlayer can cope with this
  return tile as unknown as BinaryFeatures;
}

export default CartoVectorTileLoader;
