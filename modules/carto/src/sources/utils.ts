import {CartoAPIError} from '../api/carto-api-error';
import {DEFAULT_HEADERS, DEFAULT_PARAMETERS, MAX_GET_LENGTH} from './common';
import {buildMapsUrlFromBase} from '../config';
import type {APIErrorContext, MapType} from '../api/types';

/**
 * Simple encode parameter
 */
function encodeParameter(name: string, value: string | boolean | number): string {
  return `${name}=${encodeURIComponent(value)}`;
}

const REQUEST_CACHE = new Map();
export async function requestWithParameters<T = any>({
  baseUrl,
  parameters,
  headers: customHeaders,
  errorContext
}: {
  baseUrl: string;
  parameters?: Record<string, string>;
  headers: Record<string, string>;
  errorContext: APIErrorContext;
}): Promise<T> {
  const key = JSON.stringify({baseUrl, parameters, customHeaders});
  if (REQUEST_CACHE.has(key)) {
    return REQUEST_CACHE.get(key);
  }

  let url = baseUrl;
  if (parameters) {
    const allParameters = {...DEFAULT_PARAMETERS, ...parameters};
    const encodedParameters = Object.entries(allParameters).map(([key, value]) => {
      return encodeParameter(key, value);
    });
    url += `?${encodedParameters.join('&')}`;
  }

  const headers = {...DEFAULT_HEADERS, ...customHeaders};
  try {
    /* global fetch */
    let response: Response;
    if (url.length > MAX_GET_LENGTH) {
      response = await fetch(url, {method: 'POST', body: JSON.stringify(parameters), headers});
    } else {
      response = await fetch(url, {headers});
    }
    let json: any;
    try {
      json = await response.json();
    } catch {
      json = {error: ''};
    }
    if (!response.ok) {
      REQUEST_CACHE.delete(key);
      throw new CartoAPIError(json.error, errorContext, response);
    }

    REQUEST_CACHE.set(key, json);
    return json;
  } catch (error) {
    throw new CartoAPIError(error as Error, errorContext);
  }
}

export function buildApiEndpoint({
  apiBaseUrl,
  connectionName,
  endpoint,
  mapsUrl
}: {
  apiBaseUrl: string;
  connectionName: string;
  endpoint: MapType;
  mapsUrl?: string;
}): string {
  return `${mapsUrl || buildMapsUrlFromBase(apiBaseUrl)}/${connectionName}/${endpoint}`;
}
