// const REQUEST_GET_MAX_URL_LENGTH = 2048;
const VECTOR_EXTENT = 2048;
const VECTOR_SIMPLIFY_EXTENT = 2048;
const DEFAULT_USER_COMPONENT_IN_URL = '{user}';

export async function instantiateMap(credentials, sql) {
  const mapConfig = {
    version: '1.3.1',
    buffersize: {mvt: 1},
    layers: [
      {
        type: 'mapnik',
        options: {
          sql,
          vector_extent: VECTOR_EXTENT,
          vector_simplify_extent: VECTOR_SIMPLIFY_EXTENT
        }
      }
    ]
  };

  const encodedApiKey = encodeParameter('api_key', credentials.apiKey);
  const encodedClient = encodeParameter('client', 'deck-gl-carto');
  const parameters = [encodedApiKey, encodedClient];

  const url = generateMapsApiUrl(credentials, parameters);

  const opts = {
    method: 'POST',
    headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
    body: JSON.stringify(mapConfig)
  };

  /* global fetch */
  /* eslint no-undef: "error" */
  const response = await fetch(url, opts);
  const layergroup = await response.json();
  return layergroup.metadata.tilejson.vector.tiles;

  // return layergroup;
}

function generateMapsApiUrl(credentials, parameters) {
  const base = `${serverURL(credentials)}api/v1/map`;
  return `${base}?${parameters.join('&')}`;
}

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

function encodeParameter(name, value) {
  return `${name}=${encodeURIComponent(value)}`;
}
