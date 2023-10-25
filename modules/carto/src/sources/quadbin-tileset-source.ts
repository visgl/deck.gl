import {baseSource} from './base-source';
import type {SourceOptions, TilesetSourceOptions, TilejsonSource} from './types';

export type QuadbinTilesetSourceOptions = SourceOptions & TilesetSourceOptions;
type UrlParameters = {name: string};

const quadbinTilesetSource: TilejsonSource<QuadbinTilesetSourceOptions> = async function (
  options: QuadbinTilesetSourceOptions
): Promise<any> {
  const {tableName} = options;
  const urlParameters: UrlParameters = {name: tableName};

  return baseSource<UrlParameters>('tileset', options, urlParameters);
};

export {quadbinTilesetSource};
