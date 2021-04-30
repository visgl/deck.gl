import {API_VERSIONS} from './api/maps-api-common';
import {log} from '@deck.gl/core';

const defaultClassicConfig = {
  username: 'public',
  apiKey: 'default_public',
  region: 'us',
  // SQL API URL
  sqlUrl: 'https://{user}.carto.com/api/v2/sql'
};

const defaultCloudNativeConfig = {
  accessToken: null,
  tenant: 'gcp-us-east1.app.carto.com'
};

let config = {};

export function setDefaultCredentials(opts) {
  log.warn(
    'setDefaultCredentials will be deprecated in future versions. Use setConfig method instead.'
  )();
  setConfig({
    apiVersion: API_VERSIONS.V2,
    ...opts
  });
}

export function getDefaultCredentials() {
  return config;
}

export function setConfig(opts) {
  const apiVersion = opts.apiVersion || API_VERSIONS.V2;

  switch (apiVersion) {
    case API_VERSIONS.V1:
      opts.mapsUrl = opts.mapsUrl || 'https://{user}.carto.com/api/v1/map';
      config = {
        apiVersion,
        ...defaultClassicConfig,
        ...opts
      };
      break;

    case API_VERSIONS.V2:
      opts.mapsUrl = opts.mapsUrl || 'https://maps-api-v2.{region}.carto.com/user/{user}';
      config = {
        apiVersion,
        ...defaultClassicConfig,
        ...opts
      };

      break;
    case API_VERSIONS.V3:
      opts.mapsUrl = opts.mapsUrl || 'https://maps-{tenant}';
      config = {
        apiVersion,
        ...defaultCloudNativeConfig,
        ...opts
      };
      break;
    default:
      throw new Error(`Invalid API version ${apiVersion}`);
  }
}

export function getConfig() {
  return config;
}
