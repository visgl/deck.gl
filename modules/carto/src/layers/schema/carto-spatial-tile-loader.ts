import {LoaderOptions, LoaderWithParser} from '@loaders.gl/loader-utils';

import {Tile, TileReader} from './carto-spatial-tile';
import {parsePbf} from './tile-loader-utils';
import {IndexScheme, binaryToSpatialjson, SpatialJson} from './spatialjson-utils';

const VERSION = typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'latest';

const CartoSpatialTileLoader: LoaderWithParser = {
  name: 'CARTO Spatial Tile',
  version: VERSION,
  id: 'cartoSpatialTile',
  module: 'carto',
  extensions: ['pbf'],
  mimeTypes: ['application/vnd.carto-spatial-tile'],
  category: 'geometry',
  parse: async (arrayBuffer, options) => parseCartoSpatialTile(arrayBuffer, options),
  parseSync: parseCartoSpatialTile,
  options: {
    cartoSpatialTile: {
      scheme: 'quadbin'
    } as {scheme: IndexScheme}
  }
};

function createWorkerLoader(loader: LoaderWithParser) {
  const {id} = loader;
  const options = loader.options[id] as {workerUrl: string};
  options.workerUrl = `http://localhost:8081/dist/${id}-worker.js`;

  return {...loader, worker: true, options};
}

const CartoSpatialTileWorkerLoader = createWorkerLoader(CartoSpatialTileLoader);

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
