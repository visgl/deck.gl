import {API_VERSIONS} from './api/maps-api-common';

export const defaultClassicCredentials = {
  apiKey: 'default_public',
  region: 'us',
  username: 'public'
} as const;

export const defaultCloudNativeCredentials = {
  apiBaseUrl: 'https://gcp-us-east1.api.carto.com'
} as const;

export interface ClassicCredentials {
  apiVersion: 'v1' | 'v2';
  apiKey: string;
  region: string;
  username: string;
  mapsUrl?: string;
}

export interface CloudNativeCredentials {
  apiVersion: 'v3';
  apiBaseUrl: string;
  accessToken?: string;
  mapsUrl?: string;
}

export type Credentials = ClassicCredentials | CloudNativeCredentials;
let credentials: Credentials = {} as Credentials;

setDefaultCredentials({});

export function setDefaultCredentials({apiVersion, ...rest}: Partial<Credentials>) {
  apiVersion = apiVersion || API_VERSIONS.V3;

  switch (apiVersion) {
    case API_VERSIONS.V1:
    case API_VERSIONS.V2:
      credentials = {apiVersion, ...defaultClassicCredentials, ...rest};
      break;
    case API_VERSIONS.V3:
      credentials = {apiVersion, ...defaultCloudNativeCredentials, ...rest};
      break;
    default:
      throw new Error(`Invalid API version ${apiVersion}. Use API_VERSIONS enum.`);
  }
}

export function getDefaultCredentials(): Credentials {
  return credentials;
}

export type V3Endpoint = 'maps' | 'stats';

function buildUrlFromBase(apiBaseUrl: string, endpoint: V3Endpoint) {
  let suffix = `/v3/${endpoint}`;
  if (apiBaseUrl.endsWith('/')) {
    suffix = suffix.substring(1);
  }

  return `${apiBaseUrl}${suffix}`;
}

export function buildMapsUrlFromBase(apiBaseUrl: string): string {
  return buildUrlFromBase(apiBaseUrl, 'maps');
}

export function buildStatsUrlFromBase(apiBaseUrl: string): string {
  return buildUrlFromBase(apiBaseUrl, 'stats');
}
