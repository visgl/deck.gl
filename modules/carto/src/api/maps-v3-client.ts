/* eslint-disable camelcase */
/**
 * Maps API Client for Carto 3
 */
import {
  getDefaultCredentials,
  buildMapsUrlFromBase,
  buildStatsUrlFromBase,
  CloudNativeCredentials
} from '../config';
import {
  API_VERSIONS,
  encodeParameter,
  Format,
  MapType,
  MAP_TYPES,
  QueryParameters,
  REQUEST_TYPES
} from './maps-api-common';

import {APIErrorContext, CartoAPIError} from './carto-api-error';

import {parseMap} from './parseMap';
import {assert} from '../utils';
import {
  GeojsonResult,
  JsonResult,
  TilejsonResult,
  h3QuerySource,
  h3TableSource,
  quadbinQuerySource,
  quadbinTableSource,
  vectorQuerySource,
  vectorTableSource,
  vectorTilesetSource
} from '../sources';
import {requestWithParameters} from '../sources/utils';

const MAX_GET_LENGTH = 8192;

export type Headers = Record<string, string>;
interface RequestParams {
  method?: string;
  url: string;
  headers?: Headers;
  accessToken?: string;
  body?: any;
  errorContext: APIErrorContext;
}

/**
 * Request against Maps API
 */
async function request({
  method,
  url,
  headers: customHeaders,
  accessToken,
  body,
  errorContext
}: RequestParams): Promise<Response> {
  const headers: Headers = {
    ...customHeaders,
    Accept: 'application/json'
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (method === 'POST') {
    headers['Content-Type'] = 'application/json';
  }

  try {
    /* global fetch */
    return await fetch(url, {
      method,
      headers,
      body
    });
  } catch (error) {
    throw new CartoAPIError(error as Error, errorContext);
  }
}

async function requestJson<T = unknown>({
  method,
  url,
  headers,
  accessToken,
  body,
  errorContext
}: RequestParams): Promise<T> {
  const response = await request({method, url, headers, accessToken, body, errorContext});
  let json;
  try {
    json = await response.json();
  } catch (error) {
    json = {error: ''};
  }

  if (!response.ok) {
    throw new CartoAPIError(json.error, errorContext, response);
  }
  return json as T;
}

/* global clearInterval, setInterval, URL */
async function _fetchMapDataset(
  dataset: {
    type: MapType;
    source: string;
    cache?: number;
    connectionName: string;
    geoColumn: string;
    data: TilejsonResult | GeojsonResult | JsonResult;
    columns: string[];
    format: Format;
    aggregationExp: string;
    aggregationResLevel: number;
    queryParameters: QueryParameters;
  },
  accessToken: string,
  credentials: CloudNativeCredentials,
  clientId?: string,
  headers?: Headers
) {
  const {
    aggregationExp,
    aggregationResLevel,
    connectionName,
    columns,
    format,
    geoColumn,
    source,
    type,
    queryParameters
  } = dataset;

  const cache: {value?: number} = {};
  const globalOptions: any = {
    accessToken,
    apiBaseUrl: credentials.apiBaseUrl,
    cache,
    clientId,
    connectionName,
    format,
    headers
  };

  if (type === 'tileset') {
    // TODO do we want a generic tilesetSource?
    // @ts-ignore
    dataset.data = await vectorTilesetSource({...globalOptions, tableName: source});
  } else {
    const [spatialDataType, spatialDataColumn] = geoColumn ? geoColumn.split(':') : ['geom'];
    if (spatialDataType === 'geom') {
      const options = {...globalOptions, spatialDataColumn};
      if (type === 'table') {
        dataset.data = await vectorTableSource({...options, columns, tableName: source});
      } else if (type === 'query') {
        dataset.data = await vectorQuerySource({...options, sqlQuery: source, queryParameters});
      }
    } else if (spatialDataType === 'h3') {
      const options = {...globalOptions, aggregationExp, aggregationResLevel, spatialDataColumn};
      if (type === 'table') {
        dataset.data = await h3TableSource({...options, columns, tableName: source});
      } else if (type === 'query') {
        dataset.data = await h3QuerySource({...options, sqlQuery: source, queryParameters});
      }
    } else if (spatialDataType === 'quadbin') {
      const options = {...globalOptions, aggregationExp, aggregationResLevel, spatialDataColumn};
      if (type === 'table') {
        dataset.data = await quadbinTableSource({...options, columns, tableName: source});
      } else if (type === 'query') {
        dataset.data = await quadbinQuerySource({...options, sqlQuery: source, queryParameters});
      }
    }
  }
  let cacheChanged = true;
  if (cache.value) {
    cacheChanged = dataset.cache !== cache.value;
    dataset.cache = cache.value;
  }

  return cacheChanged;
}

async function _fetchTilestats(
  attribute,
  dataset,
  accessToken: string,
  credentials: CloudNativeCredentials
) {
  const {connectionName: connection, source, type} = dataset;

  const statsUrl = buildStatsUrlFromBase(credentials.apiBaseUrl);
  let baseUrl = `${statsUrl}/${connection}/`;
  if (type === MAP_TYPES.QUERY) {
    baseUrl += attribute;
  } else {
    // MAP_TYPE.TABLE
    baseUrl += `${source}/${attribute}`;
  }

  const errorContext = {requestType: REQUEST_TYPES.TILE_STATS, connection, type, source};
  const headers = {Authorization: `Bearer ${accessToken}`};
  const stats = await requestWithParameters({
    baseUrl,
    headers,
    parameters: type === 'query' ? {q: source} : {},
    errorContext
  });

  // Replace tilestats for attribute with value from API
  const {attributes} = dataset.data.tilestats.layers[0];
  const index = attributes.findIndex(d => d.attribute === attribute);
  attributes[index] = stats;
  return true;
}

async function fillInMapDatasets(
  {datasets, token},
  clientId: string,
  credentials: CloudNativeCredentials,
  headers?: Headers
) {
  const promises = datasets.map(dataset =>
    _fetchMapDataset(dataset, token, credentials, clientId, headers)
  );
  return await Promise.all(promises);
}

async function fillInTileStats(
  {datasets, keplerMapConfig, token},
  credentials: CloudNativeCredentials
) {
  const attributes: {attribute?: string; dataset?: any}[] = [];
  const {layers} = keplerMapConfig.config.visState;
  for (const layer of layers) {
    for (const channel of Object.keys(layer.visualChannels)) {
      const attribute = layer.visualChannels[channel]?.name;
      if (attribute) {
        const dataset = datasets.find(d => d.id === layer.config.dataId);
        if (dataset.data.tilestats && dataset.type !== MAP_TYPES.TILESET) {
          // Only fetch stats for QUERY & TABLE map types
          attributes.push({attribute, dataset});
        }
      }
    }
  }
  // Remove duplicates to avoid repeated requests
  const filteredAttributes: {attribute?: string; dataset?: any}[] = [];
  for (const a of attributes) {
    if (
      !filteredAttributes.find(
        ({attribute, dataset}) => attribute === a.attribute && dataset === a.dataset
      )
    ) {
      filteredAttributes.push(a);
    }
  }

  const promises = filteredAttributes.map(({attribute, dataset}) =>
    _fetchTilestats(attribute, dataset, token, credentials)
  );
  return await Promise.all(promises);
}

/* eslint-disable max-statements */
export async function fetchMap({
  cartoMapId,
  clientId,
  credentials,
  headers,
  autoRefresh,
  onNewData
}: {
  cartoMapId: string;
  clientId: string;
  credentials?: CloudNativeCredentials;
  headers?: Headers;
  autoRefresh?: number;
  onNewData?: (map: any) => void;
}) {
  const defaultCredentials = getDefaultCredentials();
  const localCreds = {
    ...(defaultCredentials.apiVersion === API_VERSIONS.V3 && defaultCredentials),
    ...credentials
  } as CloudNativeCredentials;
  const {accessToken} = localCreds;

  assert(cartoMapId, 'Must define CARTO map id: fetchMap({cartoMapId: "XXXX-XXXX-XXXX"})');

  assert(localCreds.apiVersion === API_VERSIONS.V3, 'Method only available for v3');
  assert(localCreds.apiBaseUrl, 'Must define apiBaseUrl');
  if (!localCreds.mapsUrl) {
    localCreds.mapsUrl = buildMapsUrlFromBase(localCreds.apiBaseUrl);
  }

  if (autoRefresh || onNewData) {
    assert(onNewData, 'Must define `onNewData` when using autoRefresh');
    assert(typeof onNewData === 'function', '`onNewData` must be a function');
    assert(
      typeof autoRefresh === 'number' && autoRefresh > 0,
      '`autoRefresh` must be a positive number'
    );
  }

  const url = `${localCreds.mapsUrl}/public/${cartoMapId}`;
  const errorContext = {requestType: REQUEST_TYPES.PUBLIC_MAP, mapId: cartoMapId};
  const map = await requestJson<any>({url, headers, accessToken, errorContext});

  // Periodically check if the data has changed. Note that this
  // will not update when a map is published.
  let stopAutoRefresh: (() => void) | undefined;
  if (autoRefresh) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const intervalId = setInterval(async () => {
      const changed = await fillInMapDatasets(map, clientId, localCreds, headers);
      if (onNewData && changed.some(v => v === true)) {
        onNewData(parseMap(map));
      }
    }, autoRefresh * 1000);
    stopAutoRefresh = () => {
      clearInterval(intervalId);
    };
  }

  const geojsonLayers = map.keplerMapConfig.config.visState.layers.filter(
    ({type}) => type === 'geojson' || type === 'point'
  );
  const geojsonDatasetIds = geojsonLayers.map(({config}) => config.dataId);
  map.datasets.forEach(dataset => {
    if (geojsonDatasetIds.includes(dataset.id)) {
      const {config} = geojsonLayers.find(({config}) => config.dataId === dataset.id);
      dataset.format = 'geojson';
      // Support for very old maps. geoColumn was not stored in the past
      if (!dataset.geoColumn && config.columns.geojson) {
        dataset.geoColumn = config.columns.geojson;
      }
    }
  });

  // Mutates map.datasets so that dataset.data contains data
  await fillInMapDatasets(map, clientId, localCreds, headers);

  // Mutates attributes in visualChannels to contain tile stats
  await fillInTileStats(map, localCreds);
  const out = {...parseMap(map), ...{stopAutoRefresh}};

  const textLayers = out.layers.filter(layer => {
    const pointType = layer.props.pointType || '';
    return pointType.includes('text');
  });

  /* global FontFace, window, document */
  if (textLayers.length && window.FontFace && !document.fonts.check('12px Inter')) {
    // Fetch font needed for labels
    const font = new FontFace(
      'Inter',
      'url(https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2)'
    );
    await font.load().then(f => document.fonts.add(f));
  }

  return out;
}
