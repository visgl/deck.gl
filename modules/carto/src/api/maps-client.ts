/**
 * Maps API Client for Maps API v1 and Maps API v2
 */
import {
  ClassicCredentials,
  defaultClassicCredentials,
  defaultCloudNativeCredentials,
  getDefaultCredentials
} from '../config';
import {
  API_VERSIONS,
  DEFAULT_MAPS_URL_FORMAT,
  DEFAULT_REGION_COMPONENT_IN_URL,
  DEFAULT_USER_COMPONENT_IN_URL,
  encodeParameter,
  MapType,
  MAP_TYPES
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
export async function getDataV2({
  type,
  source,
  credentials
}: {
  type: MapType;
  source: string;
  credentials?: Partial<ClassicCredentials>;
}) {
  const defaultCredentials = getDefaultCredentials();
  const apiVersion = credentials?.apiVersion || defaultCredentials.apiVersion;
  // Only pick up default credentials if they have been defined for
  // correct API version
  const localCreds = {
    ...(apiVersion === API_VERSIONS.V3 ? defaultCloudNativeCredentials : defaultClassicCredentials),
    mapsUrl: DEFAULT_MAPS_URL_FORMAT[apiVersion],
    ...(defaultCredentials.apiVersion === apiVersion && defaultCredentials),
    ...credentials
  } as unknown as Required<ClassicCredentials>;

  let url: string;

  const connection = type === MAP_TYPES.TILESET ? CONNECTIONS.BIGQUERY : CONNECTIONS.CARTO;

  switch (apiVersion) {
    case API_VERSIONS.V1:
      // Maps API v1
      const mapConfig = createMapConfig(source);
      url = buildURLMapsAPIv1({mapConfig, credentials: localCreds});
      const layergroup = await request({url, credentials: localCreds});
      return layergroup.metadata.tilejson.vector;

    case API_VERSIONS.V2:
      // Maps API v2
      url = buildURLMapsAPIv2({connection, type, source, credentials: localCreds});
      return await request({url, credentials: localCreds});

    default:
      throw new Error(
        `Invalid maps API version. It should be ${API_VERSIONS.V1} or ${API_VERSIONS.V2}`
      );
  }
}

/**
 * Request against Maps API
 */
async function request({url, credentials}: {url: string; credentials: ClassicCredentials}) {
  let response;

  try {
    /* global fetch */
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
function dealWithError({
  response,
  json,
  credentials
}: {
  response: Response;
  json: any;
  credentials: ClassicCredentials;
}) {
  switch (response.status) {
    case 401:
      throw new Error(
        `Unauthorized access to Maps API: invalid combination of user ('${credentials.username}') and apiKey ('${credentials.apiKey}')`
      );
    case 403:
      throw new Error(
        `Unauthorized access to dataset: the provided apiKey('${credentials.apiKey}') doesn't provide access to the requested data`
      );

    default:
      const e =
        credentials.apiVersion === API_VERSIONS.V1 ? JSON.stringify(json.errors) : json.error;
      throw new Error(e);
  }
}

function initURLParameters(credentials: ClassicCredentials): string[] {
  const encodedApiKey = encodeParameter('api_key', credentials.apiKey);
  const encodedClient = encodeParameter('client', 'deck-gl-carto');
  return [encodedApiKey, encodedClient];
}

/**
 * Build a URL with all required parameters
 */
function buildURLMapsAPIv1({
  mapConfig,
  credentials
}: {
  mapConfig: unknown;
  credentials: Required<ClassicCredentials>;
}): string {
  const parameters = initURLParameters(credentials);
  const cfg = JSON.stringify(mapConfig);
  return `${mapsUrl(credentials)}?${parameters.join('&')}&${encodeParameter('config', cfg)}`;
}

function buildURLMapsAPIv2({
  connection,
  type,
  source,
  credentials
}: {
  connection: string;
  type: MapType;
  source: string;
  credentials: Required<ClassicCredentials>;
}): string {
  const parameters = initURLParameters(credentials);
  // Query type is mapped to 'sql' at maps api v1
  const mapsApiType = type === MAP_TYPES.QUERY ? 'sql' : type;
  let url = `${mapsUrl(credentials)}/${connection}/${mapsApiType}?`;
  url += `${encodeParameter('source', source)}&format=tilejson&${parameters.join('&')}`;
  return url;
}

/**
 * Prepare a url valid for the specified user
 */
function mapsUrl(credentials: Required<ClassicCredentials>) {
  return credentials.mapsUrl
    .replace(DEFAULT_USER_COMPONENT_IN_URL, credentials.username)
    .replace(DEFAULT_REGION_COMPONENT_IN_URL, credentials.region);
}

function createMapConfig(sql: string) {
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
          // eslint-disable-next-line camelcase
          vector_extent: TILE_EXTENT
        }
      }
    ]
  };
}
