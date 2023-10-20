/* eslint-disable camelcase */
import {baseSource} from './base-source';
import {SourceOptions, QuerySourceOptions, TypedSource} from './common';

export type VectorQuerySourceOptions = SourceOptions & QuerySourceOptions;
type UrlParameters = {geo_column?: string; q: string; queryParameters?: string};

const vectorQuerySource: TypedSource<VectorQuerySourceOptions> = async function (
  options: VectorQuerySourceOptions
): Promise<any> {
  const {spatialDataColumn, sqlQuery, queryParameters} = options;
  const urlParameters: UrlParameters = {q: sqlQuery};

  if (spatialDataColumn) {
    urlParameters.geo_column = spatialDataColumn;
  }
  if (queryParameters) {
    urlParameters.queryParameters = JSON.stringify(queryParameters);
  }
  return baseSource<UrlParameters>('query', options, urlParameters);
};

export {vectorQuerySource};
