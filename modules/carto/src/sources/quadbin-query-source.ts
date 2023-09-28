import {MAP_TYPES} from '../api/maps-api-common';
import {CartoBaseSource} from './base-source';
import {
  CartoAggregationOptions,
  CartoQuerySourceOptions,
  CartoSourceOptionalOptions,
  CartoSourceRequiredOptions,
  TilejsonSource
} from './common';

export type CartoQuadbinQuerySourceOptions = CartoSourceRequiredOptions &
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

const CartoQuadbinQuerySource: TilejsonSource<CartoQuadbinQuerySourceOptions> = async function (
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
  return CartoBaseSource<UrlParameters>(MAP_TYPES.QUERY, options, urlParameters);
};

export {CartoQuadbinQuerySource};
