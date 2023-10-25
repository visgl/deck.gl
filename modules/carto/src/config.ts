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
