import {QueryParameters} from '../api';
import {baseSource} from './base-source';
import type {SourceOptions, TilejsonResult} from './types';

export type BoundaryQuerySourceOptions = SourceOptions & {
  boundaryId: string;
  matchingColumn?: string;
  sqlQuery: string;
  queryParameters?: QueryParameters;
};
type UrlParameters = {
  boundaryId: string;
  matchingColumn: string;
  sqlQuery: string;
  queryParameters?: string;
};

export const boundaryQuerySource = async function (
  options: BoundaryQuerySourceOptions
): Promise<TilejsonResult> {
  const {boundaryId, matchingColumn = 'id', sqlQuery, queryParameters} = options;
  const urlParameters: UrlParameters = {
    boundaryId,
    matchingColumn,
    sqlQuery
  };
  if (queryParameters) {
    urlParameters.queryParameters = JSON.stringify(queryParameters);
  }
  return baseSource<UrlParameters>('boundary', options, urlParameters) as Promise<TilejsonResult>;
};
