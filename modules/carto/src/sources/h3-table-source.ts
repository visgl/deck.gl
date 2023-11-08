/* eslint-disable camelcase */
import {baseSource} from './base-source';
import type {
  AggregationOptions,
  SourceOptions,
  SpatialDataType,
  TableSourceOptions,
  TilejsonResult
} from './types';

export type H3TableSourceOptions = SourceOptions & TableSourceOptions & AggregationOptions;

type UrlParameters = {
  aggregationExp: string;
  aggregationResLevel?: string;
  columns?: string;
  spatialDataType: SpatialDataType;
  spatialDataColumn?: string;
  name: string;
};

export const h3TableSource = async function (
  options: H3TableSourceOptions
): Promise<TilejsonResult> {
  const {aggregationExp, aggregationResLevel = 4, columns, spatialDataColumn, tableName} = options;
  const urlParameters: UrlParameters = {aggregationExp, name: tableName, spatialDataType: 'h3'};

  if (aggregationResLevel) {
    urlParameters.aggregationResLevel = String(aggregationResLevel);
  }
  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  if (spatialDataColumn) {
    urlParameters.spatialDataColumn = spatialDataColumn;
  }
  return baseSource<UrlParameters>('table', options, urlParameters) as Promise<TilejsonResult>;
};
