export const DEFAULT_USER_COMPONENT_IN_URL = '{user}';
export const DEFAULT_REGION_COMPONENT_IN_URL = '{region}';

export type ValuesOf<T extends {}> = T[keyof T];
export const API_VERSIONS = {
  V1: 'v1',
  V2: 'v2',
  V3: 'v3'
} as const;
export type ApiVersion = ValuesOf<typeof API_VERSIONS>;

export const DEFAULT_MAPS_URL_FORMAT = {
  [API_VERSIONS.V1]: `https://${DEFAULT_USER_COMPONENT_IN_URL}.carto.com/api/v1/map`,
  [API_VERSIONS.V2]: `https://maps-api-v2.${DEFAULT_REGION_COMPONENT_IN_URL}.carto.com/user/${DEFAULT_USER_COMPONENT_IN_URL}`
} as const;

export const MAP_TYPES = {
  QUERY: 'query',
  TABLE: 'table',
  TILESET: 'tileset',
  RASTER: 'raster'
} as const;
export type MapType = ValuesOf<typeof MAP_TYPES>;
export const COLUMNS_SUPPORT: MapType[] = [MAP_TYPES.TABLE];
export const GEO_COLUMN_SUPPORT: MapType[] = [MAP_TYPES.QUERY, MAP_TYPES.TABLE];

// AVAILABLE FORMATS
export const FORMATS = {
  GEOJSON: 'geojson',
  NDJSON: 'ndjson',
  TILEJSON: 'tilejson',
  JSON: 'json'
} as const;
export type Format = ValuesOf<typeof FORMATS>;

// AVAILABLE FORMATS FOR TILES
export const TILE_FORMATS = {
  MVT: 'mvt',
  JSON: 'json',
  GEOJSON: 'geojson',
  BINARY: 'binary'
} as const;
export type TileFormat = ValuesOf<typeof TILE_FORMATS>;

export enum SchemaFieldType {
  Number = 'number',
  Bigint = 'bigint',
  String = 'string',
  Geometry = 'geometry',
  Timestamp = 'timestamp',
  Object = 'object',
  Boolean = 'boolean',
  Variant = 'variant',
  Unknown = 'unknown'
}
export interface SchemaField {
  name: string;
  type: SchemaFieldType; // Field type in the CARTO stack, common for all providers
}

export interface MapInstantiation extends MapInstantiationFormats {
  nrows: number;
  size?: number;
  schema: SchemaField[];
}

type MapInstantiationFormats = Record<
  Format,
  {
    url: string[];
    error?: any;
  }
>;

export const REQUEST_TYPES = {
  DATA: 'Map data',
  INSTANTIATION: 'Map instantiation',
  PUBLIC_MAP: 'Public map',
  TILE_STATS: 'Tile stats'
} as const;
export type RequestType = ValuesOf<typeof REQUEST_TYPES>;

/**
 * Simple encode parameter
 */
export function encodeParameter(name: string, value: string | boolean | number): string {
  return `${name}=${encodeURIComponent(value)}`;
}

export type QueryParameterValue = string | number | boolean | Array<QueryParameterValue> | object;

export type NamedQueryParameter = Record<string, QueryParameterValue>;

export type PositionalQueryParameter = QueryParameterValue[];

export type QueryParameters = NamedQueryParameter | PositionalQueryParameter;
