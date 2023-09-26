import {MAP_TYPES} from '../api/maps-api-common';
import {CartoBaseSource} from './base-source';
import {
  CartoAggregationOptions,
  CartoQuerySourceOptions,
  CartoSourceOptionalOptions,
  CartoSourceRequiredOptions,
  CartoTilejsonResult
} from './common';

export type CartoH3QuerySourceOptions = CartoSourceRequiredOptions &
  Partial<CartoSourceOptionalOptions> &
  CartoQuerySourceOptions &
  CartoAggregationOptions;

type UrlParameters = {
  aggregationExp?: string;
  aggregationResLevel?: string;
  geo_column?: string;
  q: string;
  queryParameters?: string;
};

export async function CartoH3QuerySource(
  options: CartoH3QuerySourceOptions
): Promise<CartoTilejsonResult> {
  const {
    aggregationExp = '1 AS value',
    aggregationResLevel = 4,
    sqlQuery,
    spatialDataColumn = 'h3:h3',
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
  return CartoBaseSource<CartoH3QuerySourceOptions, UrlParameters>(
    MAP_TYPES.QUERY,
    options,
    urlParameters
  );
}
