export const DEFAULT_USER_COMPONENT_IN_URL = '{user}';
export const DEFAULT_REGION_COMPONENT_IN_URL = '{region}';

export const API_VERSIONS = {
  V1: 'v1',
  V2: 'v2',
  V3: 'v3'
};

export const MAP_TYPES = {
  SQL: 'sql',
  TABLE: 'table',
  TILESET: 'tileset'
};

export const PROVIDERS = {
  BIGQUERY: 'bigquery',
  SNOWFLAKE: 'snowflake',
  REDSHIFT: 'redshift',
  POSTGRES: 'postgres'
};

// AVAILABLE FORMATS
export const FORMATS = {
  GEOJSON: 'geojson',
  JSON: 'json',
  TILEJSON: 'tilejson'
};

/**
 * Simple encode parameter
 */
export function encodeParameter(name, value) {
  return `${name}=${encodeURIComponent(value)}`;
}
