/* eslint-disable camelcase */
import {DEFAULT_API_BASE_URL, DEFAULT_CLIENT, DEFAULT_MAX_LENGTH_URL} from '../api/common';
import {buildSourceUrl} from '../api/endpoints';
import {requestWithParameters} from '../api/request-with-parameters';
import type {APIErrorContext, MapType} from '../api/types';
import type {
  GeojsonResult,
  JsonResult,
  SourceOptionalOptions,
  SourceRequiredOptions,
  TilejsonMapInstantiation,
  TilejsonResult
} from './types';

export const SOURCE_DEFAULTS: SourceOptionalOptions = {
  apiBaseUrl: DEFAULT_API_BASE_URL,
  clientId: DEFAULT_CLIENT,
  format: 'tilejson',
  headers: {},
  maxLengthURL: DEFAULT_MAX_LENGTH_URL
};

export async function baseSource<UrlParameters extends Record<string, unknown>>(
  endpoint: MapType,
  options: Partial<SourceOptionalOptions> & SourceRequiredOptions,
  urlParameters: UrlParameters
): Promise<TilejsonResult | GeojsonResult | JsonResult> {
  const {accessToken, connectionName, cache, ...optionalOptions} = options;
  const mergedOptions = {...SOURCE_DEFAULTS, accessToken, connectionName, endpoint};
  for (const key in optionalOptions) {
    if (optionalOptions[key]) {
      mergedOptions[key] = optionalOptions[key];
    }
  }
  const baseUrl = buildSourceUrl(mergedOptions);
  const {clientId, maxLengthURL, format} = mergedOptions;
  const headers = {Authorization: `Bearer ${options.accessToken}`, ...options.headers};
  const parameters = {client: clientId, ...urlParameters};

  const errorContext: APIErrorContext = {
    requestType: 'Map instantiation',
    connection: options.connectionName,
    type: endpoint,
    source: JSON.stringify(parameters, undefined, 2)
  };
  const mapInstantiation = await requestWithParameters<TilejsonMapInstantiation>({
    baseUrl,
    parameters,
    headers,
    errorContext,
    maxLengthURL
  });

  const dataUrl = mapInstantiation[format].url[0];
  if (cache) {
    cache.value = parseInt(new URL(dataUrl).searchParams.get('cache') || '', 10);
  }
  errorContext.requestType = 'Map data';

  if (format === 'tilejson') {
    const json = await requestWithParameters<TilejsonResult>({
      baseUrl: dataUrl,
      headers,
      errorContext,
      maxLengthURL
    });
    if (accessToken) {
      json.accessToken = accessToken;
    }
    return json;
  }

  return await requestWithParameters<GeojsonResult | JsonResult>({
    baseUrl: dataUrl,
    headers,
    errorContext,
    maxLengthURL
  });
}
