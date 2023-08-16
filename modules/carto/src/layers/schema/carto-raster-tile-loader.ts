import {LoaderOptions, LoaderWithParser} from '@loaders.gl/loader-utils';

import {TileReader} from './carto-raster-tile';
import {parsePbf} from './tile-loader-utils';
import {getWorkerUrl} from '../../utils';
import {NumericProps, Properties} from './spatialjson-utils';

const VERSION = typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'latest';
const id = 'cartoRasterTile';

type CartoRasterTileLoaderOptions = LoaderOptions & {
  cartoRasterTile?: {
    workerUrl: string;
  };
};

const DEFAULT_OPTIONS: CartoRasterTileLoaderOptions = {
  cartoRasterTile: {
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
  worker: false, // TODO set to true once workers deployed to unpkg
  options: DEFAULT_OPTIONS
};

export type Raster = {
  blockWidth: number;
  blockHeight: number;
  cells: {
    numericProps: NumericProps;
    properties: Properties[];
  };
};

function parseCartoRasterTile(
  arrayBuffer: ArrayBuffer,
  options?: CartoRasterTileLoaderOptions
): Raster | null {
  if (!arrayBuffer) return null;
  const tile = parsePbf(arrayBuffer, TileReader);
  const {bands, blockHeight, blockWidth} = tile;
  const numericProps = {};
  for (let i = 0; i < bands.length; i++) {
    const {name, data} = bands[i];
    numericProps[name] = data;
  }
  return {blockWidth, blockHeight, cells: {numericProps, properties: []}};
}

export default CartoRasterTileLoader;
