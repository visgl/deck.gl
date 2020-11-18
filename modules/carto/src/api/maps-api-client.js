import {getDefaultCredentials, getMapsVersion} from '../config';

const DEFAULT_USER_COMPONENT_IN_URL = '{user}';
const DEFAULT_REGION_COMPONENT_IN_URL = '{region}';

/**
 * Obtain a TileJson from Maps API v1 and v2
 */
export async function getTileJSON(mapConfig, credentials) {
  const creds = {...getDefaultCredentials(), ...credentials};
  switch (getMapsVersion(creds)) {
    case 'v1':
      // Maps API v1
      const layergroup = await instantiateMap({mapConfig, credentials: creds});
      return layergroup.metadata.tilejson.vector;

    case 'v2':
      // Maps API v2
      return await instantiateMap({mapConfig, credentials: creds});

    default:
      throw new Error('Invalid maps API version. It shoud be v1 or v2');
  }
}

/**
 * Instantiate a map using Maps API
 */
async function instantiateMap({mapConfig, credentials}) {
  const url = buildURL({mapConfig, credentials});

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
function buildURL({mapConfig, credentials}) {
  const cfg = JSON.stringify(mapConfig);
  const encodedApiKey = encodeParameter('api_key', credentials.apiKey);
  const encodedClient = encodeParameter('client', `deck-gl-carto`);
  const parameters = [encodedApiKey, encodedClient];
  return `${mapsUrl(credentials)}/tilejson?${parameters.join('&')}&${encodeParameter(
    'config',
    cfg
  )}`;
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
