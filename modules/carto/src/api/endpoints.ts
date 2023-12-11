import {MapType} from './types';

export type V3Endpoint = 'maps' | 'stats' | 'sql';

function joinPath(...args: string[]): string {
  return args.map(part => (part.endsWith('/') ? part.slice(0, -1) : part)).join('/');
}

function buildV3Path(
  apiBaseUrl: string,
  version: 'v3',
  endpoint: V3Endpoint,
  ...rest: string[]
): string {
  return joinPath(apiBaseUrl, version, endpoint, ...rest);
}

export function buildPublicMapUrl({
  apiBaseUrl,
  cartoMapId
}: {
  apiBaseUrl: string;
  cartoMapId: string;
}): string {
  return buildV3Path(apiBaseUrl, 'v3', 'maps', 'public', cartoMapId);
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
  if (type === 'query') {
    return buildV3Path(apiBaseUrl, 'v3', 'stats', connectionName, attribute);
  }

  // type === 'table'
  return buildV3Path(apiBaseUrl, 'v3', 'stats', connectionName, source, attribute);
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
  return buildV3Path(apiBaseUrl, 'v3', 'maps', connectionName, endpoint);
}

export function buildQueryUrl({
  apiBaseUrl,
  connectionName
}: {
  apiBaseUrl: string;
  connectionName: string;
}): string {
  return buildV3Path(apiBaseUrl, 'v3', 'sql', connectionName, 'query');
}
