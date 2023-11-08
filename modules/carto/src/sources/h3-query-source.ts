/* eslint-disable camelcase */
import {baseSource} from './base-source';
import type {
  AggregationOptions,
  QuerySourceOptions,
  SourceOptions,
  SpatialDataType,
  TilejsonResult
} from './types';

export type H3QuerySourceOptions = SourceOptions & QuerySourceOptions & AggregationOptions;
type UrlParameters = {
  aggregationExp: string;
  aggregationResLevel?: string;
  spatialDataType: SpatialDataType;
  spatialDataColumn?: string;
  q: string;
  queryParameters?: string;
};

export const h3QuerySource = async function (
  options: H3QuerySourceOptions
): Promise<TilejsonResult> {
  const {
    aggregationExp,
    aggregationResLevel = 4,
    sqlQuery,
    spatialDataColumn,
    queryParameters
  } = options;
  const urlParameters: UrlParameters = {aggregationExp, spatialDataType: 'h3', q: sqlQuery};

  if (aggregationResLevel) {
    urlParameters.aggregationResLevel = String(aggregationResLevel);
  }
  if (spatialDataColumn) {
    urlParameters.spatialDataColumn = spatialDataColumn;
  }
  if (queryParameters) {
    urlParameters.queryParameters = JSON.stringify(queryParameters);
  }
  return baseSource<UrlParameters>('query', options, urlParameters) as Promise<TilejsonResult>;
};
