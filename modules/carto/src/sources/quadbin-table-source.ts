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
  columns?: string;
  geo_column?: string;
  name: string;
  aggregationExp?: string;
  aggregationResLevel?: string;
};

const cartoQuadbinTableSource: TilejsonSource<CartoQuadbinTableSourceOptions> = async function (
  options: CartoQuadbinTableSourceOptions
): Promise<any> {
  const {
    aggregationExp = '1 AS value',
    aggregationResLevel = 6,
    columns,
    spatialDataColumn = 'quadbin:quadbin',
    tableName
  } = options;
  const urlParameters: UrlParameters = {name: tableName};

  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  if (spatialDataColumn) {
    urlParameters.geo_column = spatialDataColumn;
  }
  if (aggregationExp) {
    urlParameters.aggregationExp = aggregationExp;
  }
  if (aggregationResLevel) {
    urlParameters.aggregationResLevel = String(aggregationResLevel);
  }
  return cartoBaseSource<UrlParameters>('table', options, urlParameters);
};

export {cartoQuadbinTableSource};
