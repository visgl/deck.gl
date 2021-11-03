export const DEFAULT_USER_COMPONENT_IN_URL = '{user}';
export const DEFAULT_REGION_COMPONENT_IN_URL = '{region}';

export const API_VERSIONS = {
  V1: 'v1',
  V2: 'v2',
  V3: 'v3'
};

export const DEFAULT_MAPS_URL_FORMAT = {
  [API_VERSIONS.V1]: `https://${DEFAULT_USER_COMPONENT_IN_URL}.carto.com/api/v1/map`,
  [API_VERSIONS.V2]: `https://maps-api-v2.${DEFAULT_REGION_COMPONENT_IN_URL}.carto.com/user/${DEFAULT_USER_COMPONENT_IN_URL}`
};

export const MAP_TYPES = {
  QUERY: 'query',
  TABLE: 'table',
  TILESET: 'tileset'
};

// AVAILABLE FORMATS
export const FORMATS = {
  GEOJSON: 'geojson',
  NDJSON: 'ndjson',
  TILEJSON: 'tilejson',
  JSON: 'json'
};

/**
 * Simple encode parameter
 */
export function encodeParameter(name, value) {
  return `${name}=${encodeURIComponent(value)}`;
}
