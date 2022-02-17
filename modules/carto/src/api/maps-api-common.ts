export const DEFAULT_USER_COMPONENT_IN_URL = '{user}';
export const DEFAULT_REGION_COMPONENT_IN_URL = '{region}';

export const API_VERSIONS = {
  V1: 'v1',
  V2: 'v2',
  V3: 'v3'
} as const;

export const DEFAULT_MAPS_URL_FORMAT = {
  [API_VERSIONS.V1]: `https://${DEFAULT_USER_COMPONENT_IN_URL}.carto.com/api/v1/map`,
  [API_VERSIONS.V2]: `https://maps-api-v2.${DEFAULT_REGION_COMPONENT_IN_URL}.carto.com/user/${DEFAULT_USER_COMPONENT_IN_URL}`
} as const;

export const MAP_TYPES = {
  QUERY: 'query',
  TABLE: 'table',
  TILESET: 'tileset'
} as const;

// AVAILABLE FORMATS
export const FORMATS = {
  GEOJSON: 'geojson',
  NDJSON: 'ndjson',
  TILEJSON: 'tilejson',
  JSON: 'json'
} as const;

// AVAILABLE FORMATS FOR TILES
export const TILE_FORMATS = {
  MVT: 'mvt',
  GEOJSON: 'geojson',
  BINARY: 'binary'
} as const;

/**
 * Simple encode parameter
 */
export function encodeParameter(name: string, value: string) {
  return `${name}=${encodeURIComponent(value)}`;
}
