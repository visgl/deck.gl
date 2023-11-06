/* eslint-disable camelcase */
import {baseSource} from './base-source';
import type {AggregationOptions, QuerySourceOptions, SourceOptions, TilejsonResult} from './types';

export type H3QuerySourceOptions = SourceOptions & QuerySourceOptions & AggregationOptions;
type UrlParameters = {
  aggregationExp: string;
  aggregationResLevel?: string;
  geo_column?: string;
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
    spatialDataColumn = 'h3:h3',
    queryParameters
  } = options;
  const urlParameters: UrlParameters = {aggregationExp, q: sqlQuery};

  if (aggregationResLevel) {
    urlParameters.aggregationResLevel = String(aggregationResLevel);
  }
  if (spatialDataColumn) {
    urlParameters.geo_column = spatialDataColumn;
  }
  if (queryParameters) {
    urlParameters.queryParameters = JSON.stringify(queryParameters);
  }
  return baseSource<UrlParameters>('query', options, urlParameters) as Promise<TilejsonResult>;
};
