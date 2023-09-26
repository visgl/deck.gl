import {encodeParameter, MapType, REQUEST_TYPES} from '../api/maps-api-common';
import {APIErrorContext} from '../api/carto-api-error';
import {
  CartoSourceOptionalOptions,
  CartoSourceRequiredOptions,
  CartoTilejsonResult,
  SOURCE_DEFAULTS,
  Tilejson,
  TilejsonMapInstantiation
} from './common';
import {buildApiEndpoint, requestWithParameters} from './utils';

export async function CartoBaseSource<UrlParameters extends Record<string, string>>(
  endpoint: MapType,
  options: Partial<CartoSourceOptionalOptions> & CartoSourceRequiredOptions,
  urlParameters: UrlParameters
): Promise<CartoTilejsonResult> {
  const baseUrl = buildApiEndpoint({...SOURCE_DEFAULTS, ...options, endpoint});
  const {accessToken} = options;
  const headers = {Authorization: `Bearer ${options.accessToken}`, ...options.headers};

  const errorContext: APIErrorContext = {
    requestType: REQUEST_TYPES.INSTANTIATION,
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

  const tilejsonUrl = mapInstantiation.tilejson.url[0];
  errorContext.requestType = REQUEST_TYPES.DATA;
  const tilejson = await requestWithParameters<Tilejson>({
    baseUrl: tilejsonUrl,
    headers,
    errorContext
  });

  return {...tilejson, accessToken};
}
