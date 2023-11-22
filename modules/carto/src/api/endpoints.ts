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

export function buildPublicMapUrl({
  apiBaseUrl,
  cartoMapId
}: {
  apiBaseUrl: string;
  cartoMapId: string;
}): string {
  return `${buildMapsUrlFromBase(apiBaseUrl)}/public/${cartoMapId}`;
}

export function buildStatsUrl({
  attribute,
  apiBaseUrl,
  connectionName,
  source,
  type
}: {
  attribute: string;
  apiBaseUrl: string;
  connectionName: string;
  source: string;
  type: MapType;
}): string {
  const statsUrl = buildStatsUrlFromBase(apiBaseUrl);
  let baseUrl = `${statsUrl}/${connectionName}/`;
  if (type === 'query') {
    baseUrl += attribute;
  } else {
    // type === 'table'
    baseUrl += `${source}/${attribute}`;
  }

  return baseUrl;
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
