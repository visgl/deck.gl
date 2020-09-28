import {getDefaultCredentials} from '../auth';

const DEFAULT_USER_COMPONENT_IN_URL = '{user}';
const REQUEST_GET_MAX_URL_LENGTH = 2048;

/**
 * Obtain a TileJson from Maps API v1
 */
export async function getMapTileJSON(props) {
  const {data, bufferSize, version, tileExtent, credentials} = props;
  const creds = {...getDefaultCredentials(), ...credentials};

  const mapConfig = createMapConfig({data, bufferSize, version, tileExtent});
  const layergroup = await instantiateMap({mapConfig, credentials: creds});

  const tiles = layergroup.metadata.tilejson.vector;
  return tiles;
}

/**
 * Create a mapConfig for Maps API
 */
function createMapConfig({data, bufferSize, version, tileExtent}) {
  const isSQL = data.search(' ') > -1;
  const sql = isSQL ? data : `SELECT * FROM ${data}`;

  const mapConfig = {
    version,
    buffersize: {
      mvt: bufferSize
    },
    layers: [
      {
        type: 'mapnik',
        options: {
          sql: sql.trim(),
          vector_extent: tileExtent
        }
      }
    ]
  };
  return mapConfig;
}

/**
 * Instantiate a map, either by GET or POST, using Maps API
 */
async function instantiateMap({mapConfig, credentials}) {
  let response;

  try {
    const config = JSON.stringify(mapConfig);
    const request = createMapsApiRequest({config, credentials});
    /* global fetch */
    /* eslint no-undef: "error" */
    response = await fetch(request);
  } catch (error) {
    throw new Error(`Failed to connect to Maps API: ${error}`);
  }

  const layergroup = await response.json();

  if (!response.ok) {
    dealWithWindshaftError({response, layergroup, credentials});
  }

  return layergroup;
}

/**
 * Display proper message from Maps API error
 */
function dealWithWindshaftError({response, layergroup, credentials}) {
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
      throw new Error(`${JSON.stringify(layergroup.errors)}`);
  }
}

/**
 * Create a GET or POST request, with all required parameters
 */
function createMapsApiRequest({config, credentials}) {
  const encodedApiKey = encodeParameter('api_key', credentials.apiKey);
  const encodedClient = encodeParameter('client', `deck-gl-carto`);
  const parameters = [encodedApiKey, encodedClient];
  const url = generateMapsApiUrl(parameters, credentials);

  const getUrl = `${url}&${encodeParameter('config', config)}`;
  if (getUrl.length < REQUEST_GET_MAX_URL_LENGTH) {
    return getRequest(getUrl);
  }

  return postRequest(url, config);
}

/**
 * Generate a Maps API url for the request
 */
function generateMapsApiUrl(parameters, credentials) {
  const base = `${serverURL(credentials)}api/v1/map`;
  return `${base}?${parameters.join('&')}`;
}

/**
 * Prepare a url valid for the specified user
 */
function serverURL(credentials) {
  let url = credentials.serverUrlTemplate.replace(
    DEFAULT_USER_COMPONENT_IN_URL,
    credentials.username
  );

  if (!url.endsWith('/')) {
    url += '/';
  }

  return url;
}

/**
 * Simple GET request
 */
function getRequest(url) {
  /* global Request */
  /* eslint no-undef: "error" */
  return new Request(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });
}

/**
 * Simple POST request
 */
function postRequest(url, payload) {
  return new Request(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: payload
  });
}

/**
 * Simple encode parameter
 */
function encodeParameter(name, value) {
  return `${name}=${encodeURIComponent(value)}`;
}
