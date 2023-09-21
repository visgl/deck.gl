import {MAP_TYPES, QueryParameters} from '../api/maps-api-common';
import {CartoBaseSource} from './base-source';
import {
  CartoSourceOptionalOptions,
  CartoSourceRequiredOptions,
  CartoTilejsonResult
} from './common';

export type CartoVectorQuerySourceOptions = {
  spatialDataColumn?: string;
  sqlQuery: string;
  queryParameters?: QueryParameters;
};

type UrlParameters = {
  spatialDataColumn?: string;
  q: string;
  queryParameters?: string;
};

export async function CartoVectorQuerySource(
  options: CartoSourceRequiredOptions &
    Partial<CartoSourceOptionalOptions> &
    CartoVectorQuerySourceOptions
): Promise<CartoTilejsonResult> {
  const {spatialDataColumn, sqlQuery, queryParameters} = options;
  const urlParameters: UrlParameters = {q: sqlQuery};

  if (spatialDataColumn) {
    urlParameters.spatialDataColumn = spatialDataColumn;
  }
  if (queryParameters) {
    urlParameters.queryParameters = JSON.stringify(queryParameters);
  }
  return CartoBaseSource<CartoVectorQuerySourceOptions, UrlParameters>(
    MAP_TYPES.QUERY,
    options,
    urlParameters
  );
}
