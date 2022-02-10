/**
 * Maps API Client for Carto 3
 */
import {getDefaultCredentials, buildMapsUrlFromBase} from '../config';
import {API_VERSIONS, encodeParameter, FORMATS, MAP_TYPES} from './maps-api-common';
import {parseMap} from './parseMap';
import {log} from '@deck.gl/core';

const MAX_GET_LENGTH = 2048;
const DEFAULT_CLIENT = 'deck-gl-carto';

/**
 * Request against Maps API
 */
async function request({method, url, format, accessToken, body}) {
  let response;

  const headers = {
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
    /* eslint no-undef: "error" */
    response = await fetch(url, {
      method,
      headers,
      body
    });
  } catch (error) {
    throw new Error(`Failed to connect to Maps API: ${error}`);
  }

  if (format === FORMATS.NDJSON) {
    return response;
  }

  const json = await response.json();

  if (!response.ok) {
    dealWithError({response, error: json.error});
  }

  return json.rows ? json.rows : json;
}

/**
 * Display proper message from Maps API error
 */
function dealWithError({response, error}) {
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

/**
 * Build a URL with all required parameters
 */
function getParameters({type, source, geoColumn, columns, schema, clientId}) {
  const parameters = [encodeParameter('client', clientId || DEFAULT_CLIENT)];
  if (schema) {
    parameters.push(encodeParameter('schema', true));
  }

  const sourceName = type === MAP_TYPES.QUERY ? 'q' : 'name';
  parameters.push(encodeParameter(sourceName, source));

  if (type === MAP_TYPES.TABLE) {
    if (geoColumn) {
      parameters.push(encodeParameter('geo_column', geoColumn));
    }
    if (columns) {
      parameters.push(encodeParameter('columns', columns.join(',')));
    }
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
}) {
  const baseUrl = `${credentials.mapsUrl}/${connection}/${type}`;
  const url = `${baseUrl}?${getParameters({type, source, geoColumn, columns, schema, clientId})}`;
  const {accessToken} = credentials;

  const format = 'json';

  if (url.length > MAX_GET_LENGTH && type === MAP_TYPES.QUERY) {
    // need to be a POST request
    const body = JSON.stringify({
      q: source,
      client: clientId || DEFAULT_CLIENT
    });
    return await request({method: 'POST', url: baseUrl, format, accessToken, body});
  }

  return await request({url, format, accessToken});
}

function getUrlFromMetadata(metadata, format) {
  const m = metadata[format];

  if (m && !m.error && m.url) {
    return m.url[0];
  }

  return null;
}

function checkFetchLayerDataParameters({type, source, connection, localCreds}) {
  log.assert(connection, 'Must define connection');
  log.assert(type, 'Must define a type');
  log.assert(source, 'Must define a source');

  log.assert(localCreds.apiVersion === API_VERSIONS.V3, 'Method only available for v3');
  log.assert(localCreds.apiBaseUrl, 'Must define apiBaseUrl');
  log.assert(localCreds.accessToken, 'Must define an accessToken');
}

export async function fetchLayerData({
  type,
  source,
  connection,
  credentials,
  geoColumn,
  columns,
  format,
  schema,
  clientId
}) {
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
    schema,
    clientId
  });

  const data = await request({url, format: mapFormat, accessToken});
  const result = {data, format: mapFormat};
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
  schema,
  clientId
}) {
  const defaultCredentials = getDefaultCredentials();
  // Only pick up default credentials if they have been defined for
  // correct API version
  const localCreds = {
    ...(defaultCredentials.apiVersion === API_VERSIONS.V3 && defaultCredentials),
    ...credentials
  };
  checkFetchLayerDataParameters({type, source, connection, localCreds});

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
  let url;
  let mapFormat;

  if (format) {
    mapFormat = format;
    url = getUrlFromMetadata(metadata, format);
    log.assert(url, `Format ${format} not available`);
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
}) {
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
async function _fetchMapDataset(dataset, accessToken, credentials, clientId) {
  // First fetch metadata
  const {connectionName: connection, source, type} = dataset;
  const {url, mapFormat} = await _fetchDataUrl({
    credentials: {...credentials, accessToken},
    connection,
    source,
    type,
    clientId
  });

  // Extract the last time the data changed
  const cache = parseInt(new URL(url).searchParams.get('cache'), 10);
  if (cache && dataset.cache === cache) {
    return false;
  }
  dataset.cache = cache;

  // Only fetch if the data has changed
  const data = await request({url, format: mapFormat, accessToken});
  dataset.data = data;
  return true;
}

async function fillInMapDatasets({datasets, token}, clientId, credentials) {
  const promises = datasets.map(dataset => _fetchMapDataset(dataset, token, credentials, clientId));
  return await Promise.all(promises);
}

export async function fetchMap({cartoMapId, clientId, credentials, autoRefresh, onNewData}) {
  const defaultCredentials = getDefaultCredentials();
  const localCreds = {
    ...(defaultCredentials.apiVersion === API_VERSIONS.V3 && defaultCredentials),
    ...credentials
  };
  const {accessToken} = localCreds;

  log.assert(cartoMapId, `Must define CARTO map id: fetchMap({cartoMapId: 'XXXX-XXXX-XXXX'})`);

  log.assert(localCreds.apiVersion === API_VERSIONS.V3, 'Method only available for v3');
  log.assert(localCreds.apiBaseUrl, 'Must define apiBaseUrl');
  if (!localCreds.mapsUrl) {
    localCreds.mapsUrl = buildMapsUrlFromBase(localCreds.apiBaseUrl);
  }

  if (autoRefresh || onNewData) {
    log.assert(onNewData, 'Must define `onNewData` when using autoRefresh');
    log.assert(typeof onNewData === 'function', '`onNewData` must be a function');
    log.assert(autoRefresh > 0, '`autoRefresh` must be a positive number');
  }

  const url = `${localCreds.mapsUrl}/public/${cartoMapId}`;
  const map = await request({url, accessToken});

  // Periodically check if the data has changed. Note that this
  // will not update when a map is published.
  let stopAutoRefresh;
  if (autoRefresh) {
    const intervalId = setInterval(async () => {
      const changed = await fillInMapDatasets(map, clientId, credentials);
      if (changed.some(v => v === true)) {
        onNewData(parseMap(map));
      }
    }, autoRefresh * 1000);
    stopAutoRefresh = () => {
      clearInterval(intervalId);
    };
  }

  // Mutates map.datasets so that dataset.data contains data
  await fillInMapDatasets(map, clientId, credentials);
  return {
    ...parseMap(map),
    ...{stopAutoRefresh}
  };
}
