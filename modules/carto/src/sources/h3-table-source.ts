/* eslint-disable camelcase */
import {cartoBaseSource} from './base-source';
import {
  CartoAggregationOptions,
  CartoSourceOptions,
  CartoTableSourceOptions,
  SpatialDataType,
  TilejsonSource
} from './common';

export type CartoH3TableSourceOptions = CartoSourceOptions &
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

const cartoH3TableSource: TilejsonSource<CartoH3TableSourceOptions> = async function (
  options: CartoH3TableSourceOptions
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
  return cartoBaseSource<UrlParameters>('table', options, urlParameters);
};

export {cartoH3TableSource};
