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
type UrlParameters = {
  columns?: string;
  filters?: Record<string, unknown>;
  tilesetTableName: string;
  matchingColumn: string;
  propertiesSqlQuery: string;
  queryParameters?: Record<string, unknown> | unknown[];
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
  const json = (await baseSource<UrlParameters>(
    'boundary',
    options,
    urlParameters
  )) as TilejsonResult;
  json.matchingColumn = matchingColumn;
  return json;
};
