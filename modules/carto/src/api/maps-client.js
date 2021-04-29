import {getConfig, getMapsVersion} from '../config';
import { DEFAULT_REGION_COMPONENT_IN_URL, DEFAULT_USER_COMPONENT_IN_URL, encodeParameter}  from './maps-api-common';

export const CONNECTIONS = {
  BIGQUERY: 'bigquery',
  CARTO: 'carto'
};

const BUFFER_SIZE = 16;
const TILE_EXTENT = 4096

/**
 * Obtain a TileJson from Maps API v1 and v2
 */
export async function getMapCarto({ type, source, credentials}) {
  const creds = {...getConfig(), ...credentials};
  let url;

  const connection = type === 'tileset' ? CONNECTIONS.BIGQUERY : CONNECTIONS.CARTO;

  switch (getMapsVersion(creds)) {
    case 'v1':
      // Maps API v1
      const mapConfig = createMapConfig(source)
      url = buildURLMapsAPIv1({mapConfig, credentials: creds});
      const layergroup = await request({url, credentials: creds});
      return [layergroup.metadata.tilejson.vector, 'tilejson'];

    case 'v2':
      // Maps API v2
      url = buildURLMapsAPIv2({connection, type, source, credentials: creds});
      return [await request({url, credentials: creds}), 'tilejson'];

    default:
      throw new Error('Invalid maps API version. It shoud be v1 or v2');
  }
}

function isSQL(source) {
  return source.search(' ') > -1;
}

function getType({connection, source}) {
  if (connection === CONNECTIONS.BIGQUERY) 
    return 'tileset'
  
  return isSQL(source) ? 'sql' : 'table'
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

function initURLParameters(credentials) {
  const encodedApiKey = encodeParameter('api_key', credentials.apiKey);
  const encodedClient = encodeParameter('client', `deck-gl-carto`);
  return [encodedApiKey, encodedClient];
}

/**
 * Build a URL with all required parameters
 */
function buildURLMapsAPIv1({mapConfig, credentials}) {
  const parameters = initURLParameters(credentials);
  const cfg = JSON.stringify(mapConfig);
  return `${mapsUrl(credentials)}?${parameters.join('&')}&${encodeParameter('config', cfg)}`;
}

function buildURLMapsAPIv2({connection, type, source, credentials}) {
  const parameters = initURLParameters(credentials);
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

function createMapConfig(sql) {

  return {
    version: '1.3.1',
    buffersize: {
      mvt: BUFFER_SIZE
    },
    layers: [
      {
        type: 'mapnik',
        options: {
          sql,
          vector_extent: TILE_EXTENT
        }
      }
    ]
  };
}
 