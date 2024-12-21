export declare const DEFAULT_USER_COMPONENT_IN_URL = '{user}';
export declare const DEFAULT_REGION_COMPONENT_IN_URL = '{region}';
export declare type ValuesOf<T extends {}> = T[keyof T];
export declare const API_VERSIONS: {
  readonly V1: 'v1';
  readonly V2: 'v2';
  readonly V3: 'v3';
};
export declare type ApiVersion = ValuesOf<typeof API_VERSIONS>;
export declare const DEFAULT_MAPS_URL_FORMAT: {
  readonly v1: 'https://{user}.carto.com/api/v1/map';
  readonly v2: 'https://maps-api-v2.{region}.carto.com/user/{user}';
};
export declare const MAP_TYPES: {
  readonly QUERY: 'query';
  readonly TABLE: 'table';
  readonly TILESET: 'tileset';
};
export declare type MapType = ValuesOf<typeof MAP_TYPES>;
export declare const COLUMNS_SUPPORT: MapType[];
export declare const GEO_COLUMN_SUPPORT: MapType[];
export declare const FORMATS: {
  readonly GEOJSON: 'geojson';
  readonly NDJSON: 'ndjson';
  readonly TILEJSON: 'tilejson';
  readonly JSON: 'json';
};
export declare type Format = ValuesOf<typeof FORMATS>;
export declare const TILE_FORMATS: {
  readonly MVT: 'mvt';
  readonly JSON: 'json';
  readonly GEOJSON: 'geojson';
  readonly BINARY: 'binary';
};
export declare type TileFormat = ValuesOf<typeof TILE_FORMATS>;
export declare enum SchemaFieldType {
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
  type: SchemaFieldType;
}
export interface MapInstantiation extends MapInstantiationFormats {
  nrows: number;
  size?: number;
  schema: SchemaField[];
}
declare type MapInstantiationFormats = Record<
  Format,
  {
    url: string[];
    error?: any;
  }
>;
export declare const REQUEST_TYPES: {
  readonly DATA: 'Map data';
  readonly INSTANTIATION: 'Map instantiation';
  readonly PUBLIC_MAP: 'Public map';
  readonly TILE_STATS: 'Tile stats';
};
export declare type RequestType = ValuesOf<typeof REQUEST_TYPES>;
/**
 * Simple encode parameter
 */
export declare function encodeParameter(name: string, value: string | boolean | number): string;
export declare type QueryParameterValue =
  | string
  | number
  | boolean
  | Array<QueryParameterValue>
  | object;
export declare type NamedQueryParameter = Record<string, QueryParameterValue>;
export declare type PositionalQueryParameter = QueryParameterValue[];
export declare type QueryParameters = NamedQueryParameter | PositionalQueryParameter;
export {};
// # sourceMappingURL=maps-api-common.d.ts.map
