import {baseSource} from './base-source';
import type {SourceOptions, TilesetSourceOptions, TilejsonResult} from './types';

export type VectorTilesetSourceOptions = SourceOptions & TilesetSourceOptions;
type UrlParameters = {name: string};

export const vectorTilesetSource = async function (
  options: VectorTilesetSourceOptions
): Promise<TilejsonResult> {
  const {tableName} = options;
  const urlParameters: UrlParameters = {name: tableName};

  return baseSource<UrlParameters>('tileset', options, urlParameters) as Promise<TilejsonResult>;
};
