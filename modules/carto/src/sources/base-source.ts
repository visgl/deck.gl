import type {MapType} from '../api/maps-api-common';
import type {APIErrorContext} from '../api/carto-api-error';
import {
  SourceOptionalOptions,
  SourceRequiredOptions,
  TilejsonResult,
  GeojsonResult,
  JsonResult,
  SOURCE_DEFAULTS,
  Tilejson,
  TilejsonMapInstantiation
} from './common';
import {buildApiEndpoint, requestWithParameters} from './utils';

export async function baseSource<UrlParameters extends Record<string, string>>(
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
  const baseUrl = buildApiEndpoint(mergedOptions);
  const {format} = mergedOptions;
  const headers = {Authorization: `Bearer ${options.accessToken}`, ...options.headers};

  const errorContext: APIErrorContext = {
    requestType: 'Map instantiation',
    connection: options.connectionName,
    type: endpoint,
    source: JSON.stringify(urlParameters, undefined, 2)
  };
  const mapInstantiation = await requestWithParameters<TilejsonMapInstantiation>({
    baseUrl,
    parameters: urlParameters,
    headers,
    errorContext
  });

  const dataUrl = mapInstantiation[format].url[0];
  if (cache) {
    cache.value = parseInt(new URL(dataUrl).searchParams.get('cache') || '', 10);
  }
  errorContext.requestType = 'Map data';

  if (format === 'tilejson') {
    const tilejson = await requestWithParameters<Tilejson>({
      baseUrl: dataUrl,
      headers,
      errorContext
    });
    return {...tilejson, accessToken};
  }

  return await requestWithParameters<GeojsonResult | JsonResult>({
    baseUrl: dataUrl,
    headers,
    errorContext
  });
}
