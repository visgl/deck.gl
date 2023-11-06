import {baseSource} from './base-source';
import type {SourceOptions, TilejsonResult, TilesetSourceOptions} from './types';

export type RasterSourceOptions = SourceOptions & TilesetSourceOptions;
type UrlParameters = {name: string};

export const rasterSource = async function (options: RasterSourceOptions): Promise<TilejsonResult> {
  const {tableName} = options;
  const urlParameters: UrlParameters = {name: tableName};

  return baseSource<UrlParameters>('raster', options, urlParameters) as Promise<TilejsonResult>;
};
