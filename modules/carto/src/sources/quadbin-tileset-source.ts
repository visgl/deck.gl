import {baseSource} from './base-source';
import type {SourceOptions, TilejsonResult, TilesetSourceOptions} from './types';

export type QuadbinTilesetSourceOptions = SourceOptions & TilesetSourceOptions;
type UrlParameters = {name: string};

export const quadbinTilesetSource = async function (
  options: QuadbinTilesetSourceOptions
): Promise<TilejsonResult> {
  const {tableName} = options;
  const urlParameters: UrlParameters = {name: tableName};

  return baseSource<UrlParameters>('tileset', options, urlParameters) as Promise<TilejsonResult>;
};
