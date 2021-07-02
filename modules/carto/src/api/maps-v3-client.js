/**
 * Maps API Client for Carto 3
 */
import {getDefaultCredentials, buildMapsUrlFromBase} from '../config';
import {API_VERSIONS, encodeParameter, FORMATS, MAP_TYPES} from './maps-api-common';
import {log} from '@deck.gl/core';

const MAX_GET_LENGTH = 2048;

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
    case 401:
    case 403:
      throw new Error(`Unauthorized access to Maps API`);

    default:
      throw new Error(error);
  }
}

/**
 * Build a URL with all required parameters
 */
function getParameters({type, source}) {
  const encodedClient = encodeParameter('client', 'deck-gl-carto');
  const parameters = [encodedClient];

  const sourceName = type === MAP_TYPES.QUERY ? 'q' : 'name';
  parameters.push(encodeParameter(sourceName, source));

  return parameters.join('&');
}

export async function mapInstantiation({type, source, connection, credentials}) {
  const baseUrl = `${credentials.mapsUrl}/${connection}/${type}`;
  const url = `${baseUrl}?${getParameters({type, source})}`;
  const {accessToken} = credentials;

  const format = 'json';

  if (url.length > MAX_GET_LENGTH && type === MAP_TYPES.QUERY) {
    // need to be a POST request
    const body = JSON.stringify({
      q: source,
      client: 'deck-gl-carto'
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

export async function getData({type, source, connection, credentials, format}) {
  const localCreds = {...getDefaultCredentials(), ...credentials};

  log.assert(connection, 'Must define connection');
  log.assert(type, 'Must define a type');
  log.assert(source, 'Must define a source');

  log.assert(localCreds.apiVersion === API_VERSIONS.V3, 'Method only available for v3');
  log.assert(localCreds.apiBaseUrl, 'Must define apiBaseUrl');
  log.assert(localCreds.accessToken, 'Must define an accessToken');
  log.assert(localCreds.mapsUrl, 'mapsUrl cannot be undefined');

  if (!localCreds.mapsUrl) {
    localCreds.mapsUrl = buildMapsUrlFromBase(localCreds.apiBaseUrl);
  }

  const metadata = await mapInstantiation({type, source, connection, credentials: localCreds});
  let url;
  let mapFormat;

  if (format) {
    mapFormat = format;
    url = getUrlFromMetadata(metadata, format);
    log.assert(url, `Format ${format} not available`);
  } else {
    // guess map format
    const prioritizedFormats = [FORMATS.GEOJSON, FORMATS.NDJSON, FORMATS.TILEJSON];
    for (const f of prioritizedFormats) {
      url = getUrlFromMetadata(metadata, f);
      if (url) {
        mapFormat = f;
        break;
      }
    }
  }

  const {accessToken} = localCreds;

  return await request({url, format: mapFormat, accessToken});
}
