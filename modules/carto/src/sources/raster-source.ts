import {baseSource} from './base-source';
import type {SourceOptions, TilesetSourceOptions, TilejsonSource} from './types';

export type RasterSourceOptions = SourceOptions & TilesetSourceOptions;
type UrlParameters = {name: string};

const rasterSource: TilejsonSource<RasterSourceOptions> = async function (
  options: RasterSourceOptions
): Promise<any> {
  const {tableName} = options;
  const urlParameters: UrlParameters = {name: tableName};

  return baseSource<UrlParameters>('raster', options, urlParameters);
};

export {rasterSource};
