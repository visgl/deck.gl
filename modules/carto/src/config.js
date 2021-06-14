import {API_VERSIONS} from './api/maps-api-common';

const defaultClassicCredentials = {
  username: 'public',
  apiKey: 'default_public',
  region: 'us',
  mapsUrl: null
};

const defaultCloudNativeCredentials = {
  accessToken: null,
  apiBaseUrl: null,
  mapsUrl: null
};

let credentials = {};

setDefaultCredentials({});

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
      if (!opts.apiBaseUrl) {
        throw new Error(
          `API version ${
            API_VERSIONS.V3
          } requires to define apiBaseUrl at credentials. Go to https://app.carto.com to get your apiBaseUrl.`
        );
      }

      const apiBaseUrl = opts.apiBaseUrl || defaultCloudNativeCredentials.apiBaseUrl;
      opts.mapsUrl = opts.mapsUrl || buildMapsUrlFromBase(apiBaseUrl);
      credentials = {
        apiVersion,
        ...defaultCloudNativeCredentials,
        ...opts
      };
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
