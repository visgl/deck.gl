import {getDefaultCredentials, getMapsVersion} from '../config';

const DEFAULT_USER_COMPONENT_IN_URL = '{user}';
const DEFAULT_REGION_COMPONENT_IN_URL = '{region}';

export const MAP_TYPES = {
  SQL: 'sql',
  TABLE: 'table',
  TILESET: 'tileset'
};

export const CONNECTIONS = {
  BIGQUERY: 'bigquery',
  CARTO: 'carto'
};

/**
 * Obtain a TileJson from Maps API v1 and v2
 */
export async function getTileJSON({connection, type, source, mapConfig, credentials}) {
  const creds = {...getDefaultCredentials(), ...credentials};
  let url;

  switch (getMapsVersion(creds)) {
    case 'v1':
      // Maps API v1
      url = buildURL({mapConfig, credentials: creds});
      const layergroup = await request({url, credentials: creds});
      return layergroup.metadata.tilejson.vector;

    case 'v2':
      // Maps API v2
      url = buildURL({connection, type, source, credentials: creds});
      return await request({url, credentials: creds});

    default:
      throw new Error('Invalid maps API version. It shoud be v1 or v2');
  }
}

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

  return json;
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
      const e = getMapsVersion() === 'v1' ? JSON.stringify(json.errors) : json.error;
      throw new Error(e);
  }
}

/**
 * Build a URL with all required parameters
 */
function buildURL({connection, type, source, mapConfig, credentials}) {
  const encodedApiKey = encodeParameter('api_key', credentials.apiKey);
  const encodedClient = encodeParameter('client', `deck-gl-carto`);
  const parameters = [encodedApiKey, encodedClient];

  if (mapConfig) {
    const cfg = JSON.stringify(mapConfig);
    return `${mapsUrl(credentials)}?${parameters.join('&')}&${encodeParameter('config', cfg)}`;
  }
  let url = `${mapsUrl(credentials)}/${connection}/${type}?`;
  url += `${encodeParameter('source', source)}&format=tilejson&${parameters.join('&')}`;
  return url;
}

/**
 * Prepare a url valid for the specified user
 */
function mapsUrl(credentials) {
  return credentials.mapsUrl
    .replace(DEFAULT_USER_COMPONENT_IN_URL, credentials.username)
    .replace(DEFAULT_REGION_COMPONENT_IN_URL, credentials.region);
}

/**
 * Simple encode parameter
 */
function encodeParameter(name, value) {
  return `${name}=${encodeURIComponent(value)}`;
}
