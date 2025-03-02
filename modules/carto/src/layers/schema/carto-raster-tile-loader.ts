// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {LoaderOptions, LoaderWithParser} from '@loaders.gl/loader-utils';
import type {RasterMetadata} from '@carto/api-client';

import {TileReader} from './carto-raster-tile';
import {parsePbf} from './tile-loader-utils';
import {getWorkerUrl} from '../../utils';
import {NumericProps, Properties} from './spatialjson-utils';

const VERSION = typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'latest';
const id = 'cartoRasterTile';

type CartoRasterTileLoaderOptions = LoaderOptions & {
  cartoRasterTile?: {
    metadata: RasterMetadata | null;
    workerUrl: string;
  };
};

const DEFAULT_OPTIONS: CartoRasterTileLoaderOptions = {
  cartoRasterTile: {
    metadata: null,
    workerUrl: getWorkerUrl(id, VERSION)
  }
};

const CartoRasterTileLoader: LoaderWithParser = {
  name: 'CARTO Raster Tile',
  version: VERSION,
  id,
  module: 'carto',
  extensions: ['pbf'],
  mimeTypes: ['application/vnd.carto-raster-tile'],
  category: 'geometry',
  parse: async (arrayBuffer, options?: CartoRasterTileLoaderOptions) =>
    parseCartoRasterTile(arrayBuffer, options),
  parseSync: parseCartoRasterTile,
  worker: true,
  options: DEFAULT_OPTIONS
};

export type Raster = {
  /** Raster tiles are square, with 'blockSize' width and height in pixels. */
  blockSize: number;
  cells: {
    numericProps: NumericProps;
    properties: Properties[];
  };
};

function parseCartoRasterTile(
  arrayBuffer: ArrayBuffer,
  options?: CartoRasterTileLoaderOptions
): Raster | null {
  const metadata = options?.cartoRasterTile?.metadata;
  if (!arrayBuffer || !metadata) return null;
  // @ts-expect-error Upstream type needs to be updated
  TileReader.compression = metadata.compression;
  const out = parsePbf(arrayBuffer, TileReader);
  const {bands, blockSize} = out;

  const numericProps = {};
  for (let i = 0; i < bands.length; i++) {
    const {name, data} = bands[i];
    numericProps[name] = data;
  }
  return {blockSize, cells: {numericProps, properties: []}};
}

export default CartoRasterTileLoader;
