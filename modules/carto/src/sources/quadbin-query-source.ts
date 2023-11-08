/* eslint-disable camelcase */
import {baseSource} from './base-source';
import type {
  AggregationOptions,
  QuerySourceOptions,
  SourceOptions,
  SpatialDataType,
  TilejsonResult
} from './types';

export type QuadbinQuerySourceOptions = SourceOptions & QuerySourceOptions & AggregationOptions;

type UrlParameters = {
  aggregationExp: string;
  aggregationResLevel?: string;
  spatialDataType: SpatialDataType;
  spatialDataColumn?: string;
  q: string;
  queryParameters?: string;
};

export const quadbinQuerySource = async function (
  options: QuadbinQuerySourceOptions
): Promise<TilejsonResult> {
  const {
    aggregationExp,
    aggregationResLevel = 6,
    sqlQuery,
    spatialDataColumn = 'quadbin',
    queryParameters
  } = options;
  const urlParameters: UrlParameters = {
    aggregationExp,
    q: sqlQuery,
    spatialDataColumn,
    spatialDataType: 'quadbin'
  };

  if (aggregationResLevel) {
    urlParameters.aggregationResLevel = String(aggregationResLevel);
  }
  if (queryParameters) {
    urlParameters.queryParameters = JSON.stringify(queryParameters);
  }
  return baseSource<UrlParameters>('query', options, urlParameters) as Promise<TilejsonResult>;
};
