/* eslint-disable camelcase */
import {baseSource} from './base-source';
import {AggregationOptions, SourceOptions, TableSourceOptions, TilejsonSource} from './common';

export type QuadbinTableSourceOptions = SourceOptions & TableSourceOptions & AggregationOptions;

type UrlParameters = {
  aggregationExp: string;
  aggregationResLevel?: string;
  columns?: string;
  geo_column?: string;
  name: string;
};

const quadbinTableSource: TilejsonSource<QuadbinTableSourceOptions> = async function (
  options: QuadbinTableSourceOptions
): Promise<any> {
  const {
    aggregationExp,
    aggregationResLevel = 6,
    columns,
    spatialDataColumn = 'quadbin:quadbin',
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

export {quadbinTableSource};
