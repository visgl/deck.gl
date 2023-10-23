import {baseSource} from './base-source';
import {SourceOptions, TilesetSourceOptions, TilejsonSource} from './common';

export type H3TilesetSourceOptions = SourceOptions & TilesetSourceOptions;
type UrlParameters = {name: string};

const h3TilesetSource: TilejsonSource<H3TilesetSourceOptions> = async function (
  options: H3TilesetSourceOptions
): Promise<any> {
  const {tableName} = options;
  const urlParameters: UrlParameters = {name: tableName};

  return baseSource<UrlParameters>('tileset', options, urlParameters);
};

export {h3TilesetSource};
