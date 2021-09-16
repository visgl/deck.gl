import {parseSync} from '@loaders.gl/core';
import {WKTLoader} from '@loaders.gl/wkt';

export const DEFAULT_USER_COMPONENT_IN_URL = '{user}';
export const DEFAULT_REGION_COMPONENT_IN_URL = '{region}';

export const API_VERSIONS = {
  V1: 'v1',
  V2: 'v2',
  V3: 'v3'
};

export const MAP_TYPES = {
  QUERY: 'query',
  TABLE: 'table',
  TILESET: 'tileset'
};

// AVAILABLE FORMATS
export const FORMATS = {
  GEOJSON: 'geojson',
  CSV: 'csv',
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

export function csvToGeoJson(csv, {geoColumn}) {
  const GEOM = geoColumn || 'geom';
  const json = csv.map(value => {
    try {
      const geometry = JSON.parse(value[GEOM]);
      const {...properties} = value;
      delete properties[GEOM];
      return {...geometry, properties};
    } catch (error) {
      throw new Error(`Failed to parse geometry: ${value}`);
    }
  });

  return json.filter(value => value.geometry);
}
