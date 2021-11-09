import {API_VERSIONS} from './api/maps-api-common';

export const defaultClassicCredentials = {
  apiKey: 'default_public',
  region: 'us',
  username: 'public'
};

export const defaultCloudNativeCredentials = {
  apiBaseUrl: 'https://gcp-us-east1.api.carto.com'
};

let credentials = {};

setDefaultCredentials({});

export function setDefaultCredentials(opts) {
  const apiVersion = opts.apiVersion || API_VERSIONS.V3;

  switch (apiVersion) {
    case API_VERSIONS.V1:
    case API_VERSIONS.V2:
      credentials = {apiVersion, ...defaultClassicCredentials, ...opts};
      break;
    case API_VERSIONS.V3:
      credentials = {apiVersion, ...defaultCloudNativeCredentials, ...opts};
      break;
    default:
      throw new Error(`Invalid API version ${apiVersion}. Use API_VERSIONS enum.`);
  }
}

export function getDefaultCredentials() {
  return credentials;
}

export function buildMapsUrlFromBase(apiBaseUrl) {
  let suffix = '/v3/maps';
  if (apiBaseUrl.endsWith('/')) {
    suffix = suffix.substring(1);
  }

  return `${apiBaseUrl}${suffix}`;
}
