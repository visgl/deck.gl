const REQUEST_GET_MAX_URL_LENGTH = 2048;
const VECTOR_EXTENT = 2048;
const VECTOR_SIMPLIFY_EXTENT = 2048;

export async function instantiate(sql) {

  const mapConfig = {
    version: '1.3.1',
    buffersize: {"mvt":1},
    layers: [
      {
        type: 'mapnik',
        options: {
          sql: sql,
          vector_extent: VECTOR_EXTENT,
          vector_simplify_extent: VECTOR_SIMPLIFY_EXTENT
        }
      }
    ]
  };

  const encodedApiKey = encodeParameter('api_key', 'default_public');
  const encodedClient = encodeParameter('client', 'deck-gl-carto');
  const parameters = [encodedApiKey, encodedClient];
  const url = generateMapsApiUrl(parameters);

  const opts = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(mapConfig)
  };

  const response = await fetch(url, opts);
  const layergroup = await response.json();
  return layergroup.metadata.tilejson.vector.tiles;

  // return layergroup;

}

function encodeParameter(name, value) {
  return `${name}=${encodeURIComponent(value)}`;
}

function generateMapsApiUrl(parameters) {
  const base = `https://cartovl.carto.com/api/v1/map`;
  return `${base}?${parameters.join('&')}`;
}

function getTilesTemplate(data) {

}