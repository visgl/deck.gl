import {baseSource} from './base-source';
import type {SourceOptions, TilejsonResult, TilesetSourceOptions} from './types';

export type H3TilesetSourceOptions = SourceOptions & TilesetSourceOptions;
type UrlParameters = {name: string};

export const h3TilesetSource = async function (
  options: H3TilesetSourceOptions
): Promise<TilejsonResult> {
  const {tableName} = options;
  const urlParameters: UrlParameters = {name: tableName};

  return baseSource<UrlParameters>('tileset', options, urlParameters) as Promise<TilejsonResult>;
};
