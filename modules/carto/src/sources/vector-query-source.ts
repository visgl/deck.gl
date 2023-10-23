/* eslint-disable camelcase */
import {cartoBaseSource} from './base-source';
import {CartoSourceOptions, CartoQuerySourceOptions, TypedSource, SpatialDataType} from './common';

export type CartoVectorQuerySourceOptions = CartoSourceOptions & CartoQuerySourceOptions;
type UrlParameters = {
  spatialDataType: SpatialDataType;
  spatialDataColumn?: string;
  q: string;
  queryParameters?: string;
};

const cartoVectorQuerySource: TypedSource<CartoVectorQuerySourceOptions> = async function (
  options: CartoVectorQuerySourceOptions
): Promise<any> {
  const {spatialDataColumn, sqlQuery, queryParameters} = options;
  const urlParameters: UrlParameters = {spatialDataType: 'geometry', q: sqlQuery};

  if (spatialDataColumn) {
    urlParameters.spatialDataColumn = spatialDataColumn;
  }
  if (queryParameters) {
    urlParameters.queryParameters = JSON.stringify(queryParameters);
  }
  return cartoBaseSource<UrlParameters>('query', options, urlParameters);
};

export {cartoVectorQuerySource};
