/* eslint-disable camelcase */
import {cartoBaseSource} from './base-source';
import {
  CartoAggregationOptions,
  CartoSourceOptions,
  CartoTableSourceOptions,
  TilejsonSource
} from './common';

export type CartoQuadbinTableSourceOptions = CartoSourceOptions &
  CartoTableSourceOptions &
  CartoAggregationOptions;

type UrlParameters = {
  aggregationExp: string;
  aggregationResLevel?: string;
  columns?: string;
  geo_column?: string;
  name: string;
};

const cartoQuadbinTableSource: TilejsonSource<CartoQuadbinTableSourceOptions> = async function (
  options: CartoQuadbinTableSourceOptions
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
  return cartoBaseSource<UrlParameters>('table', options, urlParameters);
};

export {cartoQuadbinTableSource};
