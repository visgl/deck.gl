import {baseSource} from './base-source';
import type {SourceOptions, TilesetSourceOptions, TilejsonSource} from './types';

export type VectorTilesetSourceOptions = SourceOptions & TilesetSourceOptions;
type UrlParameters = {name: string};

const vectorTilesetSource: TilejsonSource<VectorTilesetSourceOptions> = async function (
  options: VectorTilesetSourceOptions
): Promise<any> {
  const {tableName} = options;
  const urlParameters: UrlParameters = {name: tableName};

  return baseSource<UrlParameters>('tileset', options, urlParameters);
};

export {vectorTilesetSource};
