import {APIErrorContext, CartoAPIError} from '../api/carto-api-error';
import {encodeParameter, MapType} from '../api/maps-api-common';
import {DEFAULT_HEADERS, DEFAULT_PARAMETERS, MAX_GET_LENGTH} from './common';
import {buildMapsUrlFromBase} from '../config';

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
    const json = await response.json();
    if (!response.ok) {
      throw new CartoAPIError(json.error, errorContext, response);
    }

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
