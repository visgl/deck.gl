/* eslint-disable camelcase */
import {baseSource} from './base-source';
import type {
  FilterOptions,
  SourceOptions,
  QuerySourceOptions,
  SpatialDataType,
  TilejsonResult
} from './types';

export type VectorQuerySourceOptions = SourceOptions &
  QuerySourceOptions &
  FilterOptions & {
    columns?: string[];
  };
type UrlParameters = {
  columns?: string;
  filters?: string;
  spatialDataType: SpatialDataType;
  spatialDataColumn?: string;
  q: string;
  queryParameters?: string;
};

export const vectorQuerySource = async function (
  options: VectorQuerySourceOptions
): Promise<TilejsonResult> {
  const {columns, filters, spatialDataColumn = 'geom', sqlQuery, queryParameters} = options;
  const urlParameters: UrlParameters = {spatialDataColumn, spatialDataType: 'geo', q: sqlQuery};

  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  if (filters) {
    urlParameters.filters = JSON.stringify(filters);
  }
  if (queryParameters) {
    urlParameters.queryParameters = JSON.stringify(queryParameters);
  }
  return baseSource<UrlParameters>('query', options, urlParameters) as Promise<TilejsonResult>;
};
