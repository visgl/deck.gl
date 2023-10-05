import {LoaderOptions, LoaderWithParser} from '@loaders.gl/loader-utils';

import {Tile, TileReader} from './carto-properties-tile';
import {parsePbf} from './tile-loader-utils';

const CartoPropertiesTileLoader: LoaderWithParser = {
  name: 'CARTO Properties Tile',
  version: '1',
  id: 'cartoPropertiesTile',
  module: 'carto',
  extensions: ['pbf'],
  mimeTypes: ['application/vnd.carto-properties-tile'],
  category: 'geometry',
  worker: false,
  parse: async (arrayBuffer, options) => parseCartoPropertiesTile(arrayBuffer, options),
  parseSync: parseCartoPropertiesTile,
  options: {}
};

function parseCartoPropertiesTile(arrayBuffer: ArrayBuffer, options?: LoaderOptions): Tile | null {
  if (!arrayBuffer) return null;
  return parsePbf(arrayBuffer, TileReader);
}

export default CartoPropertiesTileLoader;
