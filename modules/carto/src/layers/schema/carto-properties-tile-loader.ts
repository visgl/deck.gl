// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {LoaderOptions, LoaderWithParser} from '@loaders.gl/loader-utils';

import {Tile, TileReader} from './carto-properties-tile';
import {parsePbf} from './tile-loader-utils';
import {getWorkerUrl} from '../../utils';

const VERSION = typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'latest';
const id = 'cartoPropertiesTile';

type CartoPropertiesTileLoaderOptions = LoaderOptions & {
  cartoPropertiesTile?: {
    workerUrl: string;
  };
};

const DEFAULT_OPTIONS: CartoPropertiesTileLoaderOptions = {
  cartoPropertiesTile: {
    workerUrl: getWorkerUrl(id, VERSION)
  }
};

const CartoPropertiesTileLoader: LoaderWithParser = {
  name: 'CARTO Properties Tile',
  version: VERSION,
  id,
  module: 'carto',
  extensions: ['pbf'],
  mimeTypes: ['application/vnd.carto-properties-tile'],
  category: 'geometry',
  worker: true,
  parse: async (arrayBuffer, options) => parseCartoPropertiesTile(arrayBuffer, options),
  parseSync: parseCartoPropertiesTile,
  options: DEFAULT_OPTIONS
};

function parseCartoPropertiesTile(arrayBuffer: ArrayBuffer, options?: LoaderOptions): Tile | null {
  if (!arrayBuffer) return null;
  return parsePbf(arrayBuffer, TileReader);
}

export default CartoPropertiesTileLoader;
