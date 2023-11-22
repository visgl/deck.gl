import {MapType} from './types';

export type V3Endpoint = 'maps' | 'stats' | 'sql';

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

export function buildQueryUrlFromBase(apiBaseUrl: string): string {
  return buildUrlFromBase(apiBaseUrl, 'sql');
}

export function buildSourceUrl({
  apiBaseUrl,
  connectionName,
  endpoint
}: {
  apiBaseUrl: string;
  connectionName: string;
  endpoint: MapType;
}): string {
  return `${buildMapsUrlFromBase(apiBaseUrl)}/${connectionName}/${endpoint}`;
}
