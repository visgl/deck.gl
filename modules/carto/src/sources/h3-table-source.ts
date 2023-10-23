/* eslint-disable camelcase */
import {baseSource} from './base-source';
import {
  AggregationOptions,
  SourceOptions,
  SpatialDataType,
  TableSourceOptions,
  TilejsonSource
} from './common';

export type H3TableSourceOptions = SourceOptions & TableSourceOptions & AggregationOptions;

type UrlParameters = {
  aggregationExp: string;
  aggregationResLevel?: string;
  columns?: string;
  spatialDataType: SpatialDataType;
  spatialDataColumn?: string;
  name: string;
};

const h3TableSource: TilejsonSource<H3TableSourceOptions> = async function (
  options: H3TableSourceOptions
): Promise<any> {
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
  return baseSource<UrlParameters>('table', options, urlParameters);
};

export {h3TableSource};
