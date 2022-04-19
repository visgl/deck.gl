/**
 * Maps API Client for Carto 3
 */
import {getDefaultCredentials, buildMapsUrlFromBase, CloudNativeCredentials} from '../config';
import {
  API_VERSIONS,
  COLUMNS_SUPPORT,
  encodeParameter,
  Format,
  FORMATS,
  GEO_COLUMN_SUPPORT,
  MapInstantiation,
  MapType,
  MAP_TYPES,
  SchemaField,
  TileFormat,
  TILE_FORMATS
} from './maps-api-common';
import {parseMap} from './parseMap';
import {log} from '@deck.gl/core';
import {assert} from '../utils';

const MAX_GET_LENGTH = 2048;
const DEFAULT_CLIENT = 'deck-gl-carto';

interface RequestParams {
  method?: string;
  url: string;
  accessToken?: string;
  body?: any;
}

/**
 * Request against Maps API
 */
async function request({method, url, accessToken, body}: RequestParams): Promise<Response> {
  const headers: Record<string, string> = {
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
    throw new Error(`Failed to connect to Maps API: ${error}`);
  }
}

async function requestJson<T = unknown>({
  method,
  url,
  accessToken,
  body
}: RequestParams): Promise<T> {
  const response = await request({method, url, accessToken, body});
  const json = await response.json();

  if (!response.ok) {
    dealWithError({response, error: json.error});
  }
  return json as T;
}

async function requestData({
  method,
  url,
  accessToken,
  format,
  body
}: RequestParams & {
  format: Format;
}): Promise<Response | unknown> {
  if (format === FORMATS.NDJSON) {
    return request({method, url, accessToken, body});
  }

  const data = await requestJson<any>({method, url, accessToken, body});
  return data.rows ? data.rows : data;
}

/**
 * Display proper message from Maps API error
 */
function dealWithError({response, error}: {response: Response; error?: string}): never {
  switch (response.status) {
    case 400:
      throw new Error(`Bad request. ${error}`);
    case 401:
    case 403:
      throw new Error(`Unauthorized access. ${error}`);
    default:
      throw new Error(error);
  }
}

type FetchLayerDataParams = {
  type: MapType;
  source: string;
  connection: string;
  credentials: CloudNativeCredentials;
  geoColumn?: string;
  columns?: string[];
  schema?: boolean;
  clientId?: string;
  format?: Format;
  formatTiles?: TileFormat;
};

/**
 * Build a URL with all required parameters
 */
function getParameters({
  type,
  source,
  geoColumn,
  columns,
  schema,
  clientId
}: Omit<FetchLayerDataParams, 'connection' | 'credentials'>) {
  const parameters = [encodeParameter('client', clientId || DEFAULT_CLIENT)];
  if (schema) {
    parameters.push(encodeParameter('schema', true));
  }

  const sourceName = type === MAP_TYPES.QUERY ? 'q' : 'name';
  parameters.push(encodeParameter(sourceName, source));

  if (GEO_COLUMN_SUPPORT.includes(type) && geoColumn) {
    parameters.push(encodeParameter('geo_column', geoColumn));
  }
  if (COLUMNS_SUPPORT.includes(type) && columns) {
    parameters.push(encodeParameter('columns', columns.join(',')));
  }

  return parameters.join('&');
}

export async function mapInstantiation({
  type,
  source,
  connection,
  credentials,
  geoColumn,
  columns,
  schema,
  clientId
}: FetchLayerDataParams): Promise<MapInstantiation> {
  const baseUrl = `${credentials.mapsUrl}/${connection}/${type}`;
  const url = `${baseUrl}?${getParameters({type, source, geoColumn, columns, schema, clientId})}`;
  const {accessToken} = credentials;

  if (url.length > MAX_GET_LENGTH && type === MAP_TYPES.QUERY) {
    // need to be a POST request
    const body = JSON.stringify({
      q: source,
      client: clientId || DEFAULT_CLIENT
    });
    return await requestJson({method: 'POST', url: baseUrl, accessToken, body});
  }

  return await requestJson({url, accessToken});
}

function getUrlFromMetadata(metadata: MapInstantiation, format: Format): string | null {
  const m = metadata[format];

  if (m && !m.error && m.url) {
    return m.url[0];
  }

  return null;
}

function checkFetchLayerDataParameters({
  type,
  source,
  connection,
  credentials
}: FetchLayerDataParams) {
  assert(connection, 'Must define connection');
  assert(type, 'Must define a type');
  assert(source, 'Must define a source');

  assert(credentials.apiVersion === API_VERSIONS.V3, 'Method only available for v3');
  assert(credentials.apiBaseUrl, 'Must define apiBaseUrl');
  assert(credentials.accessToken, 'Must define an accessToken');
}

export interface FetchLayerDataResult {
  data: any;
  format?: Format;
  schema?: SchemaField[];
}
export async function fetchLayerData({
  type,
  source,
  connection,
  credentials,
  geoColumn,
  columns,
  format,
  formatTiles,
  schema,
  clientId
}: FetchLayerDataParams): Promise<FetchLayerDataResult> {
  // Internally we split data fetching into two parts to allow us to
  // conditionally fetch the actual data, depending on the metadata state
  const {url, accessToken, mapFormat, metadata} = await _fetchDataUrl({
    type,
    source,
    connection,
    credentials,
    geoColumn,
    columns,
    format,
    formatTiles,
    schema,
    clientId
  });

  const data = await requestData({url, format: mapFormat, accessToken});
  const result: FetchLayerDataResult = {data, format: mapFormat};
  if (schema) {
    result.schema = metadata.schema;
  }

  return result;
}

async function _fetchDataUrl({
  type,
  source,
  connection,
  credentials,
  geoColumn,
  columns,
  format,
  formatTiles,
  schema,
  clientId
}: FetchLayerDataParams) {
  const defaultCredentials = getDefaultCredentials();
  // Only pick up default credentials if they have been defined for
  // correct API version
  const localCreds = {
    ...(defaultCredentials.apiVersion === API_VERSIONS.V3 && defaultCredentials),
    ...credentials
  };
  checkFetchLayerDataParameters({type, source, connection, credentials: localCreds});

  if (!localCreds.mapsUrl) {
    localCreds.mapsUrl = buildMapsUrlFromBase(localCreds.apiBaseUrl);
  }

  const metadata = await mapInstantiation({
    type,
    source,
    connection,
    credentials: localCreds,
    geoColumn,
    columns,
    schema,
    clientId
  });
  let url: string | null = null;
  let mapFormat: Format | undefined;

  if (format) {
    mapFormat = format;
    url = getUrlFromMetadata(metadata, format);
    assert(url, `Format ${format} not available`);
  } else {
    // guess map format
    const prioritizedFormats = [FORMATS.GEOJSON, FORMATS.JSON, FORMATS.NDJSON, FORMATS.TILEJSON];
    for (const f of prioritizedFormats) {
      url = getUrlFromMetadata(metadata, f);
      if (url) {
        mapFormat = f;
        break;
      }
    }
    assert(url && mapFormat, 'Unsupported data formats received from backend.');
  }

  if (format === FORMATS.TILEJSON && formatTiles) {
    log.assert(
      Object.values(TILE_FORMATS).includes(formatTiles),
      `Invalid value for formatTiles: ${formatTiles}. Use value from TILE_FORMATS`
    );
    url += `&${encodeParameter('formatTiles', formatTiles)}`;
  }

  const {accessToken} = localCreds;
  return {url, accessToken, mapFormat, metadata};
}

export async function getData({
  type,
  source,
  connection,
  credentials,
  geoColumn,
  columns,
  format,
  clientId
}: FetchLayerDataParams) {
  log.deprecated('getData', 'fetchLayerData')();
  const layerData = await fetchLayerData({
    type,
    source,
    connection,
    credentials,
    geoColumn,
    columns,
    format,
    schema: false,
    clientId
  });
  return layerData.data;
}

/* global clearInterval, setInterval, URL */
async function _fetchMapDataset(
  dataset,
  accessToken: string,
  credentials: CloudNativeCredentials,
  clientId?: string
) {
  const {connectionName: connection, columns, format, geoColumn, source, type} = dataset;
  // First fetch metadata
  const {url, mapFormat} = await _fetchDataUrl({
    clientId,
    credentials: {...credentials, accessToken},
    connection,
    columns,
    format,
    geoColumn,
    source,
    type
  });

  // Extract the last time the data changed
  const cache = parseInt(new URL(url).searchParams.get('cache') || '', 10);
  if (cache && dataset.cache === cache) {
    return false;
  }
  dataset.cache = cache;

  // Only fetch if the data has changed
  dataset.data = await requestData({url, format: mapFormat, accessToken});

  return true;
}

async function fillInMapDatasets(
  {datasets, token},
  clientId: string,
  credentials: CloudNativeCredentials
) {
  const promises = datasets.map(dataset => _fetchMapDataset(dataset, token, credentials, clientId));
  return await Promise.all(promises);
}

export async function fetchMap({
  cartoMapId,
  clientId,
  credentials,
  autoRefresh,
  onNewData
}: {
  cartoMapId: string;
  clientId: string;
  credentials?: CloudNativeCredentials;
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
  const map = await requestJson<any>({url, accessToken});

  // Periodically check if the data has changed. Note that this
  // will not update when a map is published.
  let stopAutoRefresh: (() => void) | undefined;
  if (autoRefresh) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const intervalId = setInterval(async () => {
      const changed = await fillInMapDatasets(map, clientId, localCreds);
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
      dataset.format = 'geojson';
    }
  });

  // Mutates map.datasets so that dataset.data contains data
  await fillInMapDatasets(map, clientId, localCreds);
  return {
    ...parseMap(map),
    ...{stopAutoRefresh}
  };
}
