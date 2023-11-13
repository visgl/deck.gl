import {SOURCE_DEFAULTS} from '../sources';
import type {SourceOptions, QuerySourceOptions, QueryResult} from '../sources/types';
import {buildQueryUrlFromBase} from './endpoints';
import {requestWithParameters} from './request-with-parameters';
import {APIErrorContext} from './types';

export type QueryOptions = SourceOptions & Omit<QuerySourceOptions, 'spatialDataColumn'>;
type UrlParameters = {q: string; queryParameters?: string};

export const query = async function (options: QueryOptions): Promise<QueryResult> {
  const {apiBaseUrl, connectionName, sqlQuery, queryParameters} = options;
  const urlParameters: UrlParameters = {q: sqlQuery};

  if (queryParameters) {
    urlParameters.queryParameters = JSON.stringify(queryParameters);
  }

  const queryUrl = buildQueryUrlFromBase(apiBaseUrl || SOURCE_DEFAULTS.apiBaseUrl);
  const baseUrl = `${queryUrl}/${connectionName}/query`;
  const headers = {Authorization: `Bearer ${options.accessToken}`, ...options.headers};

  const errorContext: APIErrorContext = {
    requestType: 'SQL',
    connection: options.connectionName,
    type: 'query',
    source: JSON.stringify(urlParameters, undefined, 2)
  };
  return await requestWithParameters<QueryResult>({
    baseUrl,
    parameters: urlParameters,
    headers,
    errorContext
  });
};
