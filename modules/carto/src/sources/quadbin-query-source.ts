/* eslint-disable camelcase */
import {cartoBaseSource} from './base-source';
import {
  CartoAggregationOptions,
  CartoQuerySourceOptions,
  CartoSourceOptions,
  TilejsonSource
} from './common';

export type CartoQuadbinQuerySourceOptions = CartoSourceOptions &
  CartoQuerySourceOptions &
  CartoAggregationOptions;

type UrlParameters = {
  aggregationExp?: string;
  aggregationResLevel?: string;
  geo_column?: string;
  q: string;
  queryParameters?: string;
};

const cartoQuadbinQuerySource: TilejsonSource<CartoQuadbinQuerySourceOptions> = async function (
  options: CartoQuadbinQuerySourceOptions
): Promise<any> {
  const {
    aggregationExp = '1 AS value',
    aggregationResLevel = 6,
    sqlQuery,
    spatialDataColumn = 'quadbin:quadbin',
    queryParameters
  } = options;
  const urlParameters: UrlParameters = {q: sqlQuery};

  if (aggregationExp) {
    urlParameters.aggregationExp = aggregationExp;
  }
  if (aggregationResLevel) {
    urlParameters.aggregationResLevel = String(aggregationResLevel);
  }
  if (spatialDataColumn) {
    urlParameters.geo_column = spatialDataColumn;
  }
  if (queryParameters) {
    urlParameters.queryParameters = JSON.stringify(queryParameters);
  }
  return cartoBaseSource<UrlParameters>('query', options, urlParameters);
};

export {cartoQuadbinQuerySource};
