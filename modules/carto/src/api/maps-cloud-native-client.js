import {getDefaultCredentials} from '../config';
import {encodeParameter, PROVIDERS, FORMATS}  from './maps-api-common';

export const CONNECTIONS = {
  BIGQUERY: 'bigquery',
  CARTO: 'carto'
};

/**
 * Request against Maps API
 */
async function request({url, credentials}) {
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

  const json = await response.json();

  if (!response.ok) {
    dealWithError({response, json, credentials});
  }

  return json.rows ? json.rows : json;
}

/**
 * Display proper message from Maps API error
 */
function dealWithError({response, json, credentials}) {
  switch (response.status) {
    case 401:
      throw new Error(
        `Unauthorized access to Maps API: invalid combination of user ('${
          credentials.username
        }') and apiKey ('${credentials.apiKey}')`
      );
    case 403:
      throw new Error(
        `Unauthorized access to dataset: the provided apiKey('${
          credentials.apiKey
        }') doesn't provide access to the requested data`
      );

    default:
      const e = json.error;
      throw new Error(e);
  }
}

/**
 * Build a URL with all required parameters
 */
function buildURL({provider, type, source, connection, credentials, format}) {
  const encodedClient = encodeParameter('client', 'deck-gl-carto');
  const parameters = [encodedClient];
  
  parameters.push(encodeParameter('access_token', credentials.accessToken));
  parameters.push(encodeParameter('source',source))
  parameters.push(encodeParameter('connection',connection))

  if (format) {
    parameters.push(encodeParameter('format', format));
  }

  return `${credentials.mapsUrl}/${provider}/${type}?${parameters.join('&')}`;
}

async function getMapMetadata({provider, type, source, connection, credentials}) {
  const url = buildURL({provider, type, source, connection, credentials});

  return await request({url, credentials});
}

function getUrlFromMetadata(metadata){
  if (metadata.size === undefined) {
    throw Error('Undefined response size');
  }

  const priorizedFormats = [FORMATS.GEOJSON, FORMATS.JSON, FORMATS.TILEJSON];

  for (const format of priorizedFormats) {
    const m = metadata[format];

    if (m && !m.error && m.url) {
      return [m.url[0], format];
    }
  }

  throw new Error('Layer not available');
}

export async function getMap({provider, type, source, connection, credentials, format}) {
  const creds = {...getDefaultCredentials(), ...credentials};

  if (format) {
    const formatUrl = buildURL({provider, type, source, connection, credentials: creds, format})
    return [await request({url: formatUrl, credentials: creds}), format];
  }

  const metadata = await getMapMetadata({provider, type, source, connection, credentials:creds });
  const [url, mapFormat] = await getUrlFromMetadata(metadata);
  return [await request({url, credentials: creds}), mapFormat];

}