import {baseSource} from './base-source';
import {SourceOptions, TilesetSourceOptions, TilejsonSource} from './common';

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
