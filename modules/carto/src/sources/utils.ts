import {APIErrorContext, CartoAPIError} from '../api/carto-api-error';
import {encodeParameter, MapType, TileFormat} from '../api/maps-api-common';
import {
  CartoSourceOptions,
  DEFAULT_HEADERS,
  DEFAULT_PARAMETERS,
  MAX_GET_LENGTH,
  SOURCE_DEFAULTS
} from './common';
import {buildMapsUrlFromBase} from '../config';

function encodeParameters(parameters) {
  return Object.entries(parameters).map(([key, value]) => {
    if (typeof value !== 'string') {
      value = JSON.stringify(value);
    }
    return encodeParameter(key, value as string);
  });
}

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
    const encodedParameters = encodeParameters({...DEFAULT_PARAMETERS, ...parameters});
    url += `?${encodedParameters.join('&')}`;
  }
  const headers = {...DEFAULT_HEADERS, ...customHeaders};
  try {
    /* global fetch */
    let response;
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

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

/**
 * Decorator function to apply global options to a Source object
 *
 * Example:
 * const AuthenticatedSource = withDefaults<typeof CartoXXXSource>(CartoXXXSource, {accessToken: 'XXX'});
 * const tilejson = await AuthenticatedSource({tableName: 'my.table'});
 */
export function withDefaults<T extends (...args: any) => any>(
  Source: T,
  defaults: Partial<CartoSourceOptions>
) {
  // Modify passed in options type so that all global options are optional
  type Options = Parameters<T>[0];
  type LocalOptions = Optional<Options, keyof CartoSourceOptions>;
  return (options: LocalOptions) => Source({...SOURCE_DEFAULTS, ...defaults, ...options});
}

export function buildApiEndpoint({
  apiBaseUrl,
  connectionName,
  mapsUrl,
  endpoint
}: CartoSourceOptions & {endpoint: MapType}): string {
  return `${mapsUrl || buildMapsUrlFromBase(apiBaseUrl)}/${connectionName}/${endpoint}`;
}
