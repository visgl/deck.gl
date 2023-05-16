import {LoaderOptions, LoaderWithParser} from '@loaders.gl/loader-utils';

import {TileReader} from './carto-raster-tile';
import {parsePbf} from './tile-loader-utils';
import {NumericProps, Properties} from './spatialjson-utils';

const CartoRasterTileLoader: LoaderWithParser = {
  name: 'CARTO Raster Tile',
  version: '1',
  id: 'cartoRasterTile',
  module: 'carto',
  extensions: ['pbf'],
  mimeTypes: ['application/vnd.carto-raster-tile'],
  category: 'geometry',
  worker: false,
  parse: async (arrayBuffer, options) => parseCartoRasterTile(arrayBuffer, options),
  parseSync: parseCartoRasterTile,
  options: {}
};

export type Raster = {
  blockWidth: number;
  blockHeight: number;
  cells: {
    numericProps: NumericProps;
    properties: Properties[];
  };
};

function parseCartoRasterTile(arrayBuffer: ArrayBuffer, options?: LoaderOptions): Raster | null {
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
