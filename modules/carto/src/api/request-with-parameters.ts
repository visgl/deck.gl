import {CartoAPIError} from './carto-api-error';
import {DEFAULT_HEADERS, DEFAULT_PARAMETERS, MAX_GET_LENGTH} from './common';
import type {APIErrorContext} from './types';

/**
 * Simple encode parameter
 */
function encodeParameter(name: string, value: string | boolean | number): string {
  return `${name}=${encodeURIComponent(value)}`;
}

const REQUEST_CACHE = new Map<string, Promise<unknown>>();
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
  const key = createCacheKey(baseUrl, parameters || {}, customHeaders || {});
  if (REQUEST_CACHE.has(key)) {
    return REQUEST_CACHE.get(key) as Promise<T>;
  }

  const url = parameters ? createURLWithParameters(baseUrl, parameters) : baseUrl;
  const headers = {...DEFAULT_HEADERS, ...customHeaders};

  /* global fetch */
  const fetchPromise =
    url.length > MAX_GET_LENGTH
      ? fetch(baseUrl, {method: 'POST', body: JSON.stringify(parameters), headers})
      : fetch(url, {headers});

  let response: Response | undefined;
  const jsonPromise: Promise<T> = fetchPromise
    .then((_response: Response) => {
      response = _response;
      return response.json();
    })
    .then((json: any) => {
      if (!response || !response.ok) {
        throw new Error(json.error);
      }
      return json;
    })
    .catch((error: Error) => {
      REQUEST_CACHE.delete(key);
      throw new CartoAPIError(error, errorContext, response);
    });

  REQUEST_CACHE.set(key, jsonPromise);
  return jsonPromise;
}

function createCacheKey(
  baseUrl: string,
  parameters: Record<string, string>,
  headers: Record<string, string>
): string {
  const parameterEntries = Object.entries(parameters).sort(([a], [b]) => (a > b ? 1 : -1));
  const headerEntries = Object.entries(headers).sort(([a], [b]) => (a > b ? 1 : -1));
  return JSON.stringify({baseUrl, parameters: parameterEntries, headers: headerEntries});
}

function createURLWithParameters(baseUrl: string, parameters: Record<string, string>): string {
  const encodedParameters = Object.entries({...DEFAULT_PARAMETERS, ...parameters}).map(
    ([key, value]) => {
      return encodeParameter(key, value);
    }
  );
  return `${baseUrl}?${encodedParameters.join('&')}`;
}
