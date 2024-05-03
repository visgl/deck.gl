import {QueryParameters} from '../api/index';
import {baseSource} from './base-source';
import type {FilterOptions, SourceOptions, TilejsonResult} from './types';

export type BoundaryQuerySourceOptions = SourceOptions &
  FilterOptions & {
    columns?: string[];
    tilesetTableName: string;
    matchingColumn?: string;
    propertiesSqlQuery: string;
    queryParameters?: QueryParameters;
  };
type UrlParameters = FilterOptions & {
  columns?: string;
  tilesetTableName: string;
  matchingColumn: string;
  propertiesSqlQuery: string;
  queryParameters?: QueryParameters;
};

export const boundaryQuerySource = async function (
  options: BoundaryQuerySourceOptions
): Promise<TilejsonResult> {
  const {
    columns,
    filters,
    tilesetTableName,
    matchingColumn = 'id',
    propertiesSqlQuery,
    queryParameters
  } = options;
  const urlParameters: UrlParameters = {
    tilesetTableName,
    matchingColumn,
    propertiesSqlQuery
  };

  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  if (filters) {
    urlParameters.filters = filters;
  }
  if (queryParameters) {
    urlParameters.queryParameters = queryParameters;
  }
  return baseSource<UrlParameters>('boundary', options, urlParameters) as Promise<TilejsonResult>;
};
