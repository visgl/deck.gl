import {CartoAPIError} from './carto-api-error';
import {DEFAULT_HEADERS, DEFAULT_PARAMETERS, MAX_GET_LENGTH} from './common';
import type {APIErrorContext} from './types';

/**
 * Simple encode parameter
 */
function encodeParameter(name: string, value: string | boolean | number): string {
  return `${name}=${encodeURIComponent(value)}`;
}

const REQUEST_CACHE = new Map();
export async function requestWithParameters<T = any>({
  accessToken,
  baseUrl,
  parameters,
  headers: customHeaders,
  errorContext
}: {
  accessToken?: string;
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
      response = await fetch(baseUrl, {method: 'POST', body: JSON.stringify(parameters), headers});
    } else {
      response = await fetch(url, {headers});
    }
    let json: any;
    try {
      json = await response.json();
      if (accessToken) {
        json.accessToken = accessToken;
      }
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
