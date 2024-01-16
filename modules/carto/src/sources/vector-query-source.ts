/* eslint-disable camelcase */
import {baseSource} from './base-source';
import type {
  SourceOptions,
  QuerySourceOptions,
  SpatialDataType,
  TilejsonResult,
  ColumnsOption
} from './types';

export type VectorQuerySourceOptions = SourceOptions & QuerySourceOptions & ColumnsOption;
type UrlParameters = {
  columns?: string;
  spatialDataType: SpatialDataType;
  spatialDataColumn?: string;
  q: string;
  queryParameters?: string;
};

export const vectorQuerySource = async function (
  options: VectorQuerySourceOptions
): Promise<TilejsonResult> {
  const {spatialDataColumn = 'geom', sqlQuery, queryParameters, columns} = options;
  const urlParameters: UrlParameters = {spatialDataColumn, spatialDataType: 'geo', q: sqlQuery};

  if (queryParameters) {
    urlParameters.queryParameters = JSON.stringify(queryParameters);
  }
  if (columns) {
    urlParameters.columns = columns.join(',');
  }
  return baseSource<UrlParameters>('query', options, urlParameters) as Promise<TilejsonResult>;
};
