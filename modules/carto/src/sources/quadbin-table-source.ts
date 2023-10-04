/* eslint-disable camelcase */
import {cartoBaseSource} from './base-source';
import {
  CartoAggregationOptions,
  CartoSourceOptions,
  CartoTableSourceOptions,
  SpatialDataType,
  TilejsonSource
} from './common';

export type CartoQuadbinTableSourceOptions = CartoSourceOptions &
  CartoTableSourceOptions &
  CartoAggregationOptions;

type UrlParameters = {
  aggregationExp: string;
  aggregationResLevel?: string;
  columns?: string;
  spatialDataType: SpatialDataType;
  spatialDataColumn?: string;
  name: string;
};

const cartoQuadbinTableSource: TilejsonSource<CartoQuadbinTableSourceOptions> = async function (
  options: CartoQuadbinTableSourceOptions
): Promise<any> {
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
  return cartoBaseSource<UrlParameters>('table', options, urlParameters);
};

export {cartoQuadbinTableSource};
