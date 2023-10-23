/* eslint-disable camelcase */
import {cartoBaseSource} from './base-source';
import {
  CartoAggregationOptions,
  CartoQuerySourceOptions,
  CartoSourceOptions,
  SpatialDataType,
  TilejsonSource
} from './common';

export type CartoQuadbinQuerySourceOptions = CartoSourceOptions &
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

const cartoQuadbinQuerySource: TilejsonSource<CartoQuadbinQuerySourceOptions> = async function (
  options: CartoQuadbinQuerySourceOptions
): Promise<any> {
  const {
    aggregationExp,
    aggregationResLevel = 6,
    sqlQuery,
    spatialDataColumn,
    queryParameters
  } = options;
  const urlParameters: UrlParameters = {aggregationExp, q: sqlQuery, spatialDataType: 'quadbin'};

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

export {cartoQuadbinQuerySource};
