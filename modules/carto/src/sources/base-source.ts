import {encodeParameter, MapType, REQUEST_TYPES, Tilejson} from '../api/maps-api-common';
import {APIErrorContext} from '../api/carto-api-error';
import {CartoSourceOptions, CartoTilejsonResult, TilejsonMapInstantiation} from './common';
import {buildApiEndpoint, requestWithParameters} from './utils';

export async function CartoBaseSource<T>(
  endpoint: MapType,
  options: CartoSourceOptions & T,
  urlParameters: Record<keyof T, string>
): Promise<CartoTilejsonResult> {
  const baseUrl = buildApiEndpoint({...options, endpoint});
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
