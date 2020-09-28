import {getDefaultCredentials} from '../auth';

const DEFAULT_USER_COMPONENT_IN_URL = '{user}';
const REQUEST_GET_MAX_URL_LENGTH = 2048;

/**
 * Obtain a TileJson from Maps API v1 and v2
 */
export async function getMapTileJSON(props) {
  const {data, bufferSize, version, tileExtent, credentials} = props;
  const creds = {...getDefaultCredentials(), ...credentials};
  const majorVersion = getMajorVersion(version);
  let mapConfig;

  switch (majorVersion) {
    case 1:
      mapConfig = createMapConfigV1({data, bufferSize, version, tileExtent});
      const layergroup = await instantiateMap({majorVersion, mapConfig, credentials: creds});

      const tiles = layergroup.metadata.tilejson.vector;
      return tiles;

    case 2:
      mapConfig = createMapConfigV2({data, bufferSize, version, tileExtent});
      return await instantiateMap({majorVersion, mapConfig, credentials: creds});

    default:
      throw new Error('Invalid maps API version. It shoud be 1.X.X or 2.X.X');
  }
}

function getMajorVersion(mapsAPIVersion) {
  try {
    const v = mapsAPIVersion.split('.');
    return parseInt(v[0], 10);
  } catch (error) {
    throw new Error('Invalid maps API version. It shoud be 1.X.X or 2.X.X');
  }
}

/**
 * Create a mapConfig for Maps API
 */
function createMapConfigV1({data, bufferSize, version, tileExtent}) {
  const isSQL = data.search(' ') > -1;
  const sql = isSQL ? data : `SELECT * FROM ${data}`;

  return {
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
}

/**
 * Create a mapConfig for Maps API
 */
function createMapConfigV2({data, bufferSize, version, tileExtent}) {
  const isSQL = data.search(' ') > -1;
  const sql = isSQL ? data : `SELECT * FROM ${data}`;

  return {
    version,
    buffer_size: bufferSize,
    tile_extent: tileExtent,
    layers: [
      {
        type: 'query',
        options: {
          sql: sql.trim(),
          vector_extent: tileExtent
        }
      }
    ]
  };
}

/**
 * Instantiate a map, either by GET or POST, using Maps API
 */
async function instantiateMap({majorVersion, mapConfig, credentials}) {
  let response;

  try {
    const request = createMapsApiRequest({majorVersion, mapConfig, credentials});
    /* global fetch */
    /* eslint no-undef: "error" */
    response = await fetch(request);
  } catch (error) {
    throw new Error(`Failed to connect to Maps API: ${error}`);
  }

  const jsonResponse = await response.json();

  if (!response.ok) {
    dealWithError({majorVersion, response, jsonResponse, credentials});
  }

  return jsonResponse;
}

/**
 * Display proper message from Maps API error
 */
function dealWithError({majorVersion, response, jsonResponse, credentials}) {
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
      const e = majorVersion === 1 ? JSON.stringify(jsonResponse.errors) : jsonResponse.error;
      throw new Error(e);
  }
}

/**
 * Create a GET or POST request, with all required parameters
 */
function createMapsApiRequest({majorVersion, mapConfig, credentials}) {
  const config = JSON.stringify(mapConfig);
  const encodedApiKey = encodeParameter('api_key', credentials.apiKey);
  const encodedClient = encodeParameter('client', `deck-gl-carto`);
  const parameters = [encodedApiKey, encodedClient];
  const url = generateMapsApiUrl(majorVersion, parameters, credentials);

  const getUrl = `${url}&${encodeParameter('config', config)}`;
  if (getUrl.length < REQUEST_GET_MAX_URL_LENGTH) {
    return getRequest(getUrl);
  }

  return postRequest(url, config);
}

/**
 * Generate a Maps API url for the request
 */
function generateMapsApiUrl(majorVersion, parameters, credentials) {
  const base = `${serverURL(credentials)}api/v${majorVersion}/map`;
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
