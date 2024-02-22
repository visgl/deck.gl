import {SOURCE_DEFAULTS} from '../sources/index';
import type {SourceOptions, QuerySourceOptions, QueryResult} from '../sources/types';
import {buildQueryUrl} from './endpoints';
import {requestWithParameters} from './request-with-parameters';
import {APIErrorContext} from './types';

export type QueryOptions = SourceOptions & Omit<QuerySourceOptions, 'spatialDataColumn'>;
type UrlParameters = {q: string; queryParameters?: string};

export const query = async function (options: QueryOptions): Promise<QueryResult> {
  const {
    apiBaseUrl = SOURCE_DEFAULTS.apiBaseUrl,
    connectionName,
    sqlQuery,
    queryParameters
  } = options;
  const urlParameters: UrlParameters = {q: sqlQuery};

  if (queryParameters) {
    urlParameters.queryParameters = JSON.stringify(queryParameters);
  }

  const baseUrl = buildQueryUrl({apiBaseUrl, connectionName});
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
