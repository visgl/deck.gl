/* eslint-disable camelcase */
import {baseSource} from './base-source';
import type {AggregationOptions, SourceOptions, TableSourceOptions, TilejsonResult} from './types';

export type H3TableSourceOptions = SourceOptions & TableSourceOptions & AggregationOptions;

type UrlParameters = {
  aggregationExp: string;
  aggregationResLevel?: string;
  columns?: string;
  geo_column?: string;
  name: string;
};

export const h3TableSource = async function (
  options: H3TableSourceOptions
): Promise<TilejsonResult> {
  const {
    aggregationExp,
    aggregationResLevel = 4,
    columns,
    spatialDataColumn = 'h3:h3',
    tableName
  } = options;
  const urlParameters: UrlParameters = {aggregationExp, name: tableName};

  if (aggregationResLevel) {
    urlParameters.aggregationResLevel = String(aggregationResLevel);
  }
  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  if (spatialDataColumn) {
    urlParameters.geo_column = spatialDataColumn;
  }
  return baseSource<UrlParameters>('table', options, urlParameters) as Promise<TilejsonResult>;
};
