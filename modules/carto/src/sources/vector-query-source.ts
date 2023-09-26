import {MAP_TYPES, QueryParameters} from '../api/maps-api-common';
import {CartoBaseSource} from './base-source';
import {
  CartoSourceOptionalOptions,
  CartoSourceRequiredOptions,
  CartoTilejsonResult,
  CartoQuerySourceOptions
} from './common';

export type CartoVectorQuerySourceOptions = CartoSourceRequiredOptions &
  Partial<CartoSourceOptionalOptions> &
  CartoQuerySourceOptions;

type UrlParameters = {
  geo_column?: string;
  q: string;
  queryParameters?: string;
};

export async function CartoVectorQuerySource(
  options: CartoVectorQuerySourceOptions
): Promise<CartoTilejsonResult> {
  const {spatialDataColumn, sqlQuery, queryParameters} = options;
  const urlParameters: UrlParameters = {q: sqlQuery};

  if (spatialDataColumn) {
    urlParameters.geo_column = spatialDataColumn;
  }
  if (queryParameters) {
    urlParameters.queryParameters = JSON.stringify(queryParameters);
  }
  return CartoBaseSource<UrlParameters>(MAP_TYPES.QUERY, options, urlParameters);
}
