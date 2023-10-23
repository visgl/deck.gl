/* eslint-disable camelcase */
import {cartoBaseSource} from './base-source';
import {
  CartoAggregationOptions,
  CartoQuerySourceOptions,
  CartoSourceOptions,
  SpatialDataType,
  TilejsonSource
} from './common';

export type CartoH3QuerySourceOptions = CartoSourceOptions &
  CartoQuerySourceOptions &
  CartoAggregationOptions;
type UrlParameters = {
  aggregationExp: string;
  aggregationResLevel?: string;
  spatialDataType: SpatialDataType;
  spatialDataColumn?: string;
  q: string;
  queryParameters?: string;
};

const cartoH3QuerySource: TilejsonSource<CartoH3QuerySourceOptions> = async function (
  options: CartoH3QuerySourceOptions
): Promise<any> {
  const {
    aggregationExp,
    aggregationResLevel = 4,
    sqlQuery,
    spatialDataColumn,
    queryParameters
  } = options;
  const urlParameters: UrlParameters = {aggregationExp, spatialDataType: 'h3', q: sqlQuery};

  if (aggregationResLevel) {
    urlParameters.aggregationResLevel = String(aggregationResLevel);
  }
  if (spatialDataColumn) {
    urlParameters.spatialDataColumn = spatialDataColumn;
  }
  if (queryParameters) {
    urlParameters.queryParameters = JSON.stringify(queryParameters);
  }
  return cartoBaseSource<UrlParameters>('query', options, urlParameters);
};

export {cartoH3QuerySource};
