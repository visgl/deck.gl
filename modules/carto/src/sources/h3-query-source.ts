/* eslint-disable camelcase */
import {DEFAULT_AGGREGATION_RES_LEVEL_H3} from '../constants';
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
    aggregationResLevel = DEFAULT_AGGREGATION_RES_LEVEL_H3,
    sqlQuery,
    spatialDataColumn = 'h3',
    queryParameters
  } = options;
  const urlParameters: UrlParameters = {
    aggregationExp,
    spatialDataColumn,
    spatialDataType: 'h3',
    q: sqlQuery
  };

  if (aggregationResLevel) {
    urlParameters.aggregationResLevel = String(aggregationResLevel);
  }
  if (queryParameters) {
    urlParameters.queryParameters = JSON.stringify(queryParameters);
  }
  return baseSource<UrlParameters>('query', options, urlParameters) as Promise<TilejsonResult>;
};
