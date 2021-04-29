import {getDefaultCredentials, getMapsVersion} from '../config';

const DEFAULT_USER_COMPONENT_IN_URL = '{user}';
const DEFAULT_REGION_COMPONENT_IN_URL = '{region}';

export const MODE = {
  CARTO: 'carto',
  CARTO_CLOUD_NATIVE: 'carto-cloud-native'
};

export const MAP_TYPES = {
  SQL: 'sql',
  TABLE: 'table',
  TILESET: 'tileset'
};

export const PROVIDERS = {
  BIGQUERY: 'bigquery',
  SNOWFLAKE: 'snowflake',
  REDSHIFT: 'redshift',
  POSTGRES: 'postgres'
};

// AVAILABLE FORMATS
export const FORMATS = {
  GEOJSON: 'geojson',
  JSON: 'json',
  TILEJSON: 'tilejson',
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
      url = buildCartoURL({mapConfig, credentials: creds});
      const layergroup = await request({url, credentials: creds});
      return layergroup.metadata.tilejson.vector;

    case 'v2':
      // Maps API v2
      url = buildCartoURL({connection, type, source, credentials: creds});
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
      const e = getMapsVersion() === 'v1' ? JSON.stringify(json.errors) : json.error;
      throw new Error(e);
  }
}

/**
 * Build a URL with all required parameters
 */
function buildCartoCloudNativeURL({provider, type, source, connection, credentials, format}) {
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

function buildCartoURL({connection, type, source, mapConfig, credentials}) {
  const encodedApiKey = encodeParameter('api_key', credentials.apiKey);
  const encodedClient = encodeParameter('client', 'deck-gl-carto');
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

async function getMapMetadata({provider, type, source, connection, credentials}) {
  const url = buildCartoCloudNativeURL({provider, type, source, connection, credentials});

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
    const formatUrl = buildCartoCloudNativeURL({provider, type, source, connection, credentials: creds, format})
    return [await request({url: formatUrl, credentials: creds}), format];
  }

  const metadata = await getMapMetadata({provider, type, source, connection, credentials:creds });
  const [url, mapFormat] = await getUrlFromMetadata(metadata);
  return [await request({url, credentials: creds}), mapFormat];
}