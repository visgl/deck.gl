import {LoaderOptions, LoaderWithParser} from '@loaders.gl/loader-utils';
import type {BinaryFeatures} from '@loaders.gl/schema';

import {TileReader} from './carto-tile';
import {parsePbf} from './tile-loader-utils';
import {createWorkerLoader} from '../../utils';

const VERSION = typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'latest';

const CartoVectorTileLoader: LoaderWithParser = {
  name: 'CARTO Vector Tile',
  version: VERSION,
  id: 'cartoVectorTile',
  module: 'carto',
  extensions: ['pbf'],
  mimeTypes: ['application/vnd.carto-vector-tile'],
  category: 'geometry',
  parse: async (arrayBuffer, options) => parseCartoVectorTile(arrayBuffer, options),
  parseSync: parseCartoVectorTile,
  options: {}
};

function parseCartoVectorTile(
  arrayBuffer: ArrayBuffer,
  options?: LoaderOptions
): BinaryFeatures | null {
  if (!arrayBuffer) return null;
  const tile = parsePbf(arrayBuffer, TileReader);

  // Note: there is slight, difference in `numericProps` type, however geojson/mvtlayer can cope with this
  return tile as unknown as BinaryFeatures;
}

export default createWorkerLoader(CartoVectorTileLoader);
