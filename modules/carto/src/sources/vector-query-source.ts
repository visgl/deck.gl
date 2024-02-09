/* eslint-disable camelcase */
import {baseSource} from './base-source';
import type {SourceOptions, QuerySourceOptions, SpatialDataType, TilejsonResult} from './types';

export type VectorQuerySourceOptions = SourceOptions & QuerySourceOptions;
type UrlParameters = {
  spatialDataType: SpatialDataType;
  spatialDataColumn?: string;
  q: string;
  queryParameters?: string;
};

export const vectorQuerySource = async function (
  options: VectorQuerySourceOptions
): Promise<TilejsonResult> {
  const {spatialDataColumn = 'geom', sqlQuery, queryParameters} = options;
  const urlParameters: UrlParameters = {spatialDataColumn, spatialDataType: 'geo', q: sqlQuery};

  if (queryParameters) {
    urlParameters.queryParameters = JSON.stringify(queryParameters);
  }
  return baseSource<UrlParameters>('query', options, urlParameters) as Promise<TilejsonResult>;
};
