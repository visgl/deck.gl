// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {StrictLoaderOptions} from '@loaders.gl/loader-utils';
import {LoaderWithParser} from '@loaders.gl/loader-utils';

import {Tile, TileReader} from './carto-spatial-tile';
import {parsePbf} from './tile-loader-utils';
import {getWorkerUrl} from '../../utils';
import {IndexScheme, binaryToSpatialjson, SpatialJson} from './spatialjson-utils';

const VERSION = typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'latest';
const id = 'cartoSpatialTile';

type CartoSpatialTileStrictLoaderOptions = StrictLoaderOptions & {
  cartoSpatialTile?: {
    scheme: IndexScheme;
    workerUrl: string;
  };
};

const DEFAULT_OPTIONS: CartoSpatialTileStrictLoaderOptions = {
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
  parse: async (arrayBuffer, options?: CartoSpatialTileStrictLoaderOptions) =>
    parseCartoSpatialTile(arrayBuffer, options),
  parseSync: parseCartoSpatialTile,
  worker: true,
  options: DEFAULT_OPTIONS
};

function parseCartoSpatialTile(
  arrayBuffer: ArrayBuffer,
  options?: CartoSpatialTileStrictLoaderOptions
): SpatialJson | null {
  if (!arrayBuffer) return null;
  const tile: Tile = parsePbf(arrayBuffer, TileReader);

  const {cells} = tile;
  const scheme = options?.cartoSpatialTile?.scheme;
  const data = {cells, scheme};

  return binaryToSpatialjson(data);
}

export default CartoSpatialTileLoader;
