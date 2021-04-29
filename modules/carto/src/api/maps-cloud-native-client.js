import {getConfig} from '../config';
import {encodeParameter, FORMATS}  from './maps-api-common';

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

  return json.rows ? json.rows : json;
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
      const e = json.error;
      throw new Error(e);
  }
}

/**
 * Build a URL with all required parameters
 */
function buildURL({provider, type, source, connection, config, format}) {
  const encodedClient = encodeParameter('client', 'deck-gl-carto');
  const parameters = [encodedClient];
  
  parameters.push(encodeParameter('access_token', config.accessToken));
  parameters.push(encodeParameter('source',source))
  parameters.push(encodeParameter('connection',connection))

  if (format) {
    parameters.push(encodeParameter('format', format));
  }

  return `${mapsUrl(config)}/${provider}/${type}?${parameters.join('&')}`;
}

function mapsUrl(config){
  return config.mapsUrl.replace('{tenant}',config.tenant);
}

async function getMapMetadata({provider, type, source, connection, config}) {
  const url = buildURL({provider, type, source, connection, config});

  return await request({url, config});
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

export async function getMapCartoCloudNative({provider, type, source, connection, config, format}) {
  const creds = {...getConfig(), ...config};

  if (format) {
    const formatUrl = buildURL({provider, type, source, connection, config: creds, format})
    return [await request({url: formatUrl, config: creds}), format];
  }

  const metadata = await getMapMetadata({provider, type, source, connection, config:creds });
  const [url, mapFormat] = await getUrlFromMetadata(metadata);
  return [await request({url, config: creds}), mapFormat];

}