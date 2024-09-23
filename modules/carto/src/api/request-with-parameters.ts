import {VERSION} from '@deck.gl/core';
import {isPureObject} from '../utils';
import {CartoAPIError} from './carto-api-error';
import {DEFAULT_MAX_LENGTH_URL, V3_MINOR_VERSION} from './common';
import type {APIErrorContext} from './types';

/**
 * Parameters added to all requests issued with `requestWithParameters()`.
 * These parameters override parameters already in the base URL, but not
 * user-provided parameters.
 */
const DEFAULT_PARAMETERS = {
  v: V3_MINOR_VERSION,
  deckglVersion: VERSION
};

const DEFAULT_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
};

const REQUEST_CACHE = new Map<string, Promise<unknown>>();

export async function requestWithParameters<T = any>({
  baseUrl,
  parameters = {},
  headers: customHeaders = {},
  errorContext,
  maxLengthURL = DEFAULT_MAX_LENGTH_URL
}: {
  baseUrl: string;
  parameters?: Record<string, unknown>;
  headers?: Record<string, string>;
  errorContext: APIErrorContext;
  maxLengthURL?: number;
}): Promise<T> {
  parameters = {...DEFAULT_PARAMETERS, ...parameters};
  baseUrl = excludeURLParameters(baseUrl, Object.keys(parameters));
  const key = createCacheKey(baseUrl, parameters, customHeaders);
  if (REQUEST_CACHE.has(key)) {
    return REQUEST_CACHE.get(key) as Promise<T>;
  }

  const url = createURLWithParameters(baseUrl, parameters);
  const headers = {...DEFAULT_HEADERS, ...customHeaders};

  /* global fetch */
  const fetchPromise =
    url.length > maxLengthURL
      ? fetch(baseUrl, {method: 'POST', body: JSON.stringify(parameters), headers})
      : fetch(url, {headers});

  let response: Response | undefined;
  let responseJson;
  const jsonPromise: Promise<T> = fetchPromise
    .then((_response: Response) => {
      response = _response;
      return response.json();
    })
    .then((json: any) => {
      responseJson = json;
      if (!response || !response.ok) {
        throw new Error(json.error);
      }
      return json;
    })
    .catch((error: Error) => {
      REQUEST_CACHE.delete(key);
      throw new CartoAPIError(error, errorContext, response, responseJson);
    });

  REQUEST_CACHE.set(key, jsonPromise);
  return jsonPromise;
}

function createCacheKey(
  baseUrl: string,
  parameters: Record<string, unknown>,
  headers: Record<string, string>
): string {
  const parameterEntries = Object.entries(parameters).sort(([a], [b]) => (a > b ? 1 : -1));
  const headerEntries = Object.entries(headers).sort(([a], [b]) => (a > b ? 1 : -1));
  return JSON.stringify({baseUrl, parameters: parameterEntries, headers: headerEntries});
}

/**
 * Appends query string parameters to a URL. Existing URL parameters are kept,
 * unless there is a conflict, in which case the new parameters override
 * those already in the URL.
 */
function createURLWithParameters(
  baseUrlString: string,
  parameters: Record<string, unknown>
): string {
  const baseUrl = new URL(baseUrlString);
  for (const [key, value] of Object.entries(parameters)) {
    if (isPureObject(value) || Array.isArray(value)) {
      baseUrl.searchParams.set(key, JSON.stringify(value));
    } else {
      baseUrl.searchParams.set(key, (value as string | boolean | number).toString());
    }
  }
  return baseUrl.toString();
}

/**
 * Deletes query string parameters from a URL.
 */
function excludeURLParameters(baseUrlString: string, parameters: string[]) {
  const baseUrl = new URL(baseUrlString);
  for (const param of parameters) {
    if (baseUrl.searchParams.has(param)) {
      baseUrl.searchParams.delete(param);
    }
  }
  return baseUrl.toString();
}
