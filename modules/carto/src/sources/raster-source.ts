import {baseSource} from './base-source';
import type {FilterOptions, SourceOptions, TilejsonResult, TilesetSourceOptions} from './types';

export type RasterSourceOptions = SourceOptions & TilesetSourceOptions & FilterOptions;
type UrlParameters = {
  name: string,
  filters?: Record<string, unknown>
};

export const rasterSource = async function (options: RasterSourceOptions): Promise<TilejsonResult> {
  const {tableName, filters} = options;
  const urlParameters: UrlParameters = {name: tableName};
  if (filters) {
    urlParameters.filters = filters;
  }
  return baseSource<UrlParameters>('raster', options, urlParameters) as Promise<TilejsonResult>;
};
