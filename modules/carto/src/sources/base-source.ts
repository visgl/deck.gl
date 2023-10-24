import type {MapType} from '../api/maps-api-common';
import {APIErrorContext} from '../api/carto-api-error';
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
  const mergedOptions = {...SOURCE_DEFAULTS, ...options, endpoint};
  const baseUrl = buildApiEndpoint(mergedOptions);
  const {accessToken, format} = mergedOptions;
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
