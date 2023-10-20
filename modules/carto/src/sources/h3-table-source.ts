/* eslint-disable camelcase */
import {baseSource} from './base-source';
import {AggregationOptions, SourceOptions, TableSourceOptions, TilejsonSource} from './common';

export type H3TableSourceOptions = SourceOptions & TableSourceOptions & AggregationOptions;

type UrlParameters = {
  aggregationExp: string;
  aggregationResLevel?: string;
  columns?: string;
  geo_column?: string;
  name: string;
};

const h3TableSource: TilejsonSource<H3TableSourceOptions> = async function (
  options: H3TableSourceOptions
): Promise<any> {
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
  return baseSource<UrlParameters>('table', options, urlParameters);
};

export {h3TableSource};
