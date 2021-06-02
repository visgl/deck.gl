/**
 * Maps API Client for Carto Cloud Native
 */
import {getDefaultCredentials} from '../config';
import {encodeParameter, FORMATS, MAP_TYPES} from './maps-api-common';
import {log} from '@deck.gl/core';

/**
 * Request against Maps API
 */
async function request({url, format}) {
  let response;

  try {
    /* global fetch */
    /* eslint no-undef: "error" */
    response = await fetch(url, {
      headers: {
        Accept: 'application/json'
      }
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
function buildURL({type, source, connection, credentials}) {
  const encodedClient = encodeParameter('client', 'deck-gl-carto');
  const parameters = [encodedClient];

  parameters.push(encodeParameter('access_token', credentials.accessToken));
  const sourceName = type === MAP_TYPES.QUERY ? 'q' : 'name';
  parameters.push(encodeParameter(sourceName, source));

  return `${credentials.mapsUrl}/${connection}/${type}?${parameters.join('&')}`;
}

export async function getMapMetadata({type, source, connection, credentials}) {
  const url = buildURL({type, source, connection, credentials});

  return await request({url, format: 'json'});
}

function getUrlFromMetadata(metadata, format) {
  const m = metadata[format];

  if (m && !m.error && m.url) {
    return m.url[0];
  }

  return null;
}

export async function getMapCartoCloudNative({type, source, connection, credentials, format}) {
  const localCreds = {...getDefaultCredentials(), ...credentials};

  log.assert(localCreds.accessToken, 'Must define an access token');

  const metadata = await getMapMetadata({type, source, connection, credentials: localCreds});
  let url;
  let mapFormat;

  if (format) {
    mapFormat = format;
    url = getUrlFromMetadata(metadata, format);
    log.assert(url, `Format ${format} not available`);
  } else {
    // guess map format
    const priorizedFormats = [FORMATS.GEOJSON, FORMATS.NDJSON, FORMATS.TILEJSON];
    for (const f of priorizedFormats) {
      url = getUrlFromMetadata(metadata, f);
      if (url) {
        mapFormat = f;
        break;
      }
    }
  }

  return [await request({url, format: mapFormat}), mapFormat];
}
