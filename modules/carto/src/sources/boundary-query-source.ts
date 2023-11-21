import {QueryParameters} from '../api';
import {baseSource} from './base-source';
import type {SourceOptions, TilejsonResult} from './types';

export type BoundaryQuerySourceOptions = SourceOptions & {
  tilesetTableName: string;
  matchingColumn?: string;
  propertiesSqlQuery: string;
  queryParameters?: QueryParameters;
};
type UrlParameters = {
  tilesetTableName: string;
  matchingColumn: string;
  propertiesSqlQuery: string;
  queryParameters?: string;
};

export const boundaryQuerySource = async function (
  options: BoundaryQuerySourceOptions
): Promise<TilejsonResult> {
  const {tilesetTableName, matchingColumn = 'id', propertiesSqlQuery, queryParameters} = options;
  const urlParameters: UrlParameters = {
    tilesetTableName,
    matchingColumn,
    propertiesSqlQuery
  };
  if (queryParameters) {
    urlParameters.queryParameters = JSON.stringify(queryParameters);
  }
  return baseSource<UrlParameters>('boundary', options, urlParameters) as Promise<TilejsonResult>;
};
