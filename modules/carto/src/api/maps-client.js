/**
 * Maps API Client for Maps API v1 and Maps API v2
 */
import {getConfig} from '../config';
import {
  API_VERSIONS,
  DEFAULT_REGION_COMPONENT_IN_URL,
  DEFAULT_USER_COMPONENT_IN_URL,
  encodeParameter
} from './maps-api-common';

export const CONNECTIONS = {
  BIGQUERY: 'bigquery',
  CARTO: 'carto'
};

const BUFFER_SIZE = 16;
const TILE_EXTENT = 4096;

/**
 * Obtain a TileJson from Maps API v1 and v2
 */
export async function getMapCarto({type, source, config}) {
  const localConfig = {...getConfig(), ...config};
  const {apiVersion} = localConfig;
  let url;

  const connection = type === 'tileset' ? CONNECTIONS.BIGQUERY : CONNECTIONS.CARTO;

  switch (apiVersion) {
    case API_VERSIONS.V1:
      // Maps API v1
      const mapConfig = createMapConfig(source);
      url = buildURLMapsAPIv1({mapConfig, config: localConfig});
      const layergroup = await request({url, config: localConfig});
      return [layergroup.metadata.tilejson.vector, 'tilejson'];

    case API_VERSIONS.V2:
      // Maps API v2
      url = buildURLMapsAPIv2({connection, type, source, config: localConfig});
      return [await request({url, config: localConfig}), 'tilejson'];

    default:
      throw new Error(
        `Invalid maps API version. It shoud be ${API_VERSIONS.V1} or ${API_VERSIONS.V2}`
      );
  }
}

/**
 * Request against Maps API
 */
async function request({url, config}) {
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
    dealWithError({response, json, config});
  }

  return json;
}

/**
 * Display proper message from Maps API error
 */
function dealWithError({response, json, config}) {
  switch (response.status) {
    case 401:
      throw new Error(
        `Unauthorized access to Maps API: invalid combination of user ('${
          config.username
        }') and apiKey ('${config.apiKey}')`
      );
    case 403:
      throw new Error(
        `Unauthorized access to dataset: the provided apiKey('${
          config.apiKey
        }') doesn't provide access to the requested data`
      );

    default:
      const e = config.apiVersion === API_VERSIONS.V1 ? JSON.stringify(json.errors) : json.error;
      throw new Error(e);
  }
}

function initURLParameters(config) {
  const encodedApiKey = encodeParameter('api_key', config.apiKey);
  const encodedClient = encodeParameter('client', `deck-gl-carto`);
  return [encodedApiKey, encodedClient];
}

/**
 * Build a URL with all required parameters
 */
function buildURLMapsAPIv1({mapConfig, config}) {
  const parameters = initURLParameters(config);
  const cfg = JSON.stringify(mapConfig);
  return `${mapsUrl(config)}?${parameters.join('&')}&${encodeParameter('config', cfg)}`;
}

function buildURLMapsAPIv2({connection, type, source, config}) {
  const parameters = initURLParameters(config);
  let url = `${mapsUrl(config)}/${connection}/${type}?`;
  url += `${encodeParameter('source', source)}&format=tilejson&${parameters.join('&')}`;
  return url;
}

/**
 * Prepare a url valid for the specified user
 */
function mapsUrl(config) {
  return config.mapsUrl
    .replace(DEFAULT_USER_COMPONENT_IN_URL, config.username)
    .replace(DEFAULT_REGION_COMPONENT_IN_URL, config.region);
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
