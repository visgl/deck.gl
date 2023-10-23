/* eslint-disable camelcase */
import {baseSource} from './base-source';
import {SourceOptions, QuerySourceOptions, SpatialDataType, TypedSource} from './common';

export type VectorQuerySourceOptions = SourceOptions & QuerySourceOptions;
type UrlParameters = {
  spatialDataType: SpatialDataType;
  spatialDataColumn?: string;
  q: string;
  queryParameters?: string;
};

const vectorQuerySource: TypedSource<VectorQuerySourceOptions> = async function (
  options: VectorQuerySourceOptions
): Promise<any> {
  const {spatialDataColumn, sqlQuery, queryParameters} = options;
  const urlParameters: UrlParameters = {spatialDataType: 'geometry', q: sqlQuery};

  if (spatialDataColumn) {
    urlParameters.spatialDataColumn = spatialDataColumn;
  }
  if (queryParameters) {
    urlParameters.queryParameters = JSON.stringify(queryParameters);
  }
  return baseSource<UrlParameters>('query', options, urlParameters);
};

export {vectorQuerySource};
