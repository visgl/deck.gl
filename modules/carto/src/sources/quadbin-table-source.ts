/* eslint-disable camelcase */
import {baseSource} from './base-source';
import type {
  AggregationOptions,
  SourceOptions,
  SpatialDataType,
  TableSourceOptions,
  TilejsonResult
} from './types';

export type QuadbinTableSourceOptions = SourceOptions & TableSourceOptions & AggregationOptions;

type UrlParameters = {
  aggregationExp: string;
  aggregationResLevel?: string;
  columns?: string;
  spatialDataType: SpatialDataType;
  spatialDataColumn?: string;
  name: string;
};

export const quadbinTableSource = async function (
  options: QuadbinTableSourceOptions
): Promise<TilejsonResult> {
  const {aggregationExp, aggregationResLevel = 6, columns, spatialDataColumn, tableName} = options;

  const urlParameters: UrlParameters = {
    aggregationExp,
    name: tableName,
    spatialDataType: 'quadbin'
  };

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
