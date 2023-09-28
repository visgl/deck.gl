import {CartoBaseSource} from './base-source';
import {CartoSourceOptions, CartoQuerySourceOptions, TypedSource} from './common';

export type CartoVectorQuerySourceOptions = CartoSourceOptions & CartoQuerySourceOptions;
type UrlParameters = {geo_column?: string; q: string; queryParameters?: string};

const CartoVectorQuerySource: TypedSource<CartoVectorQuerySourceOptions> = async function (
  options: CartoVectorQuerySourceOptions
): Promise<any> {
  const {spatialDataColumn, sqlQuery, queryParameters} = options;
  const urlParameters: UrlParameters = {q: sqlQuery};

  if (spatialDataColumn) {
    urlParameters.geo_column = spatialDataColumn;
  }
  if (queryParameters) {
    urlParameters.queryParameters = JSON.stringify(queryParameters);
  }
  return CartoBaseSource<UrlParameters>('query', options, urlParameters);
};

export {CartoVectorQuerySource};
