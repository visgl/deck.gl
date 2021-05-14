import {API_VERSIONS} from './api/maps-api-common';

const defaultClassicCredentials = {
  username: 'public',
  apiKey: 'default_public',
  region: 'us',
  // SQL API URL
  sqlUrl: 'https://{user}.carto.com/api/v2/sql'
};

const defaultCloudNativeCredentials = {
  accessToken: null,
  tenant: 'gcp-us-east1.app.carto.com'
};

let credentials = {}

setDefaultCredentials({})

export function setDefaultCredentials(opts) {

  const apiVersion = opts.apiVersion || API_VERSIONS.V2;

  switch (apiVersion) {
    case API_VERSIONS.V1:
      opts.mapsUrl = opts.mapsUrl || 'https://{user}.carto.com/api/v1/map';
      credentials = {
        apiVersion,
        ...defaultClassicCredentials,
        ...opts
      };
      break;

    case API_VERSIONS.V2:
      opts.mapsUrl = opts.mapsUrl || 'https://maps-api-v2.{region}.carto.com/user/{user}';
      credentials = {
        apiVersion,
        ...defaultClassicCredentials,
        ...opts
      };

      break;
    case API_VERSIONS.V3:
      opts.mapsUrl = opts.mapsUrl || 'https://maps-{tenant}';
      credentials = {
        apiVersion,
        ...defaultCloudNativeCredentials,
        ...opts
      };
      break;
    default:
      throw new Error(`Invalid API version ${apiVersion}`);
  }
}

export function getDefaultCredentials() {
  return credentials;
}