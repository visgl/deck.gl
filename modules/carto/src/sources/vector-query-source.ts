/* eslint-disable camelcase */
import {DEFAULT_TILE_RESOLUTION} from '../constants';
import {baseSource} from './base-source';
import type {
  FilterOptions,
  SourceOptions,
  QuerySourceOptions,
  SpatialDataType,
  TilejsonResult,
  ColumnsOption
} from './types';

export type VectorQuerySourceOptions = SourceOptions &
  QuerySourceOptions &
  FilterOptions &
  ColumnsOption;

type UrlParameters = {
  columns?: string;
  filters?: Record<string, unknown>;
  spatialDataType: SpatialDataType;
  spatialDataColumn?: string;
  tileResolution?: string;
  q: string;
  queryParameters?: Record<string, unknown> | unknown[];
};

export const vectorQuerySource = async function (
  options: VectorQuerySourceOptions
): Promise<TilejsonResult> {
  const {
    columns,
    filters,
    spatialDataColumn = 'geom',
    sqlQuery,
    tileResolution = DEFAULT_TILE_RESOLUTION,
    queryParameters
  } = options;

  const urlParameters: UrlParameters = {
    spatialDataColumn,
    spatialDataType: 'geo',
    tileResolution: tileResolution.toString(),
    q: sqlQuery
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
  return baseSource<UrlParameters>('query', options, urlParameters) as Promise<TilejsonResult>;
};
