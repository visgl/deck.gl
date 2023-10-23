/* eslint-disable camelcase */
import type {Feature} from 'geojson';
import {Format, MapInstantiation, TileFormat, QueryParameters} from '../api/maps-api-common';

export type SourceRequiredOptions = {
  accessToken: string;
  connectionName: string;
};

export type SourceOptionalOptions = {
  apiBaseUrl: string;
  clientId: string;
  format: Format;
  formatTiles: TileFormat;
  headers: Record<string, string>;
  mapsUrl?: string;
};

export type SourceOptions = SourceRequiredOptions & Partial<SourceOptionalOptions>;

export type AggregationOptions = {
  aggregationExp: string;
  aggregationResLevel?: number;
};

export type QuerySourceOptions = {
  spatialDataColumn?: string;
  sqlQuery: string;
  queryParameters?: QueryParameters;
};

export type TableSourceOptions = {
  columns?: string[];
  spatialDataColumn?: string;
  tableName: string;
};

export type TilesetSourceOptions = {
  tableName: string;
};

export type SpatialDataType = 'geometry' | 'h3' | 'quadbin';

export const SOURCE_DEFAULTS: SourceOptionalOptions = {
  apiBaseUrl: 'https://gcp-us-east1.api.carto.com',
  clientId: 'deck-gl-carto',
  format: 'tilejson',
  formatTiles: 'binary',
  headers: {}
};

export type TilejsonMapInstantiation = MapInstantiation & {
  tilejson: {url: string[]};
};

export interface Tilejson {
  tilejson: string;
  name: string;
  description: string;
  version: string;
  attribution: string;
  scheme: string;
  tiles: string[];
  properties_tiles: string[];
  minresolution: number;
  maxresolution: number;
  minzoom: number;
  maxzoom: number;
  bounds: [number, number, number, number];
  center: [number, number, number];
  vector_layers: VectorLayer[];
  tilestats: Tilestats;
}

export interface Tilestats {
  layerCount: number;
  layers: Layer[];
}

export interface Layer {
  layer: string;
  count: number;
  attributeCount: number;
  attributes: Attribute[];
}

export interface Attribute {
  attribute: string;
  type: string;
}

export interface VectorLayer {
  id: string;
  minzoom: number;
  maxzoom: number;
  fields: Record<string, string>;
}

export type TilejsonResult = Tilejson & {accessToken: string};
export type GeojsonResult = {type: 'FeatureCollection'; features: Feature[]};
export type JsonResult = any[];
export interface TilejsonSource<T> {
  (options: T & {format?: 'tilejson'}): Promise<TilejsonResult>;
}
export interface TypedSource<T> extends TilejsonSource<T> {
  (options: T & {format: 'geojson'}): Promise<GeojsonResult>;
  (options: T & {format: 'json'}): Promise<JsonResult>;
}

export const DEFAULT_CLIENT = 'deck-gl-carto';
export const V3_MINOR_VERSION = '3.3';
export const MAX_GET_LENGTH = 8192;

export const DEFAULT_PARAMETERS = {
  client: DEFAULT_CLIENT,
  v: V3_MINOR_VERSION
};

export const DEFAULT_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
};

export const TilejsonPropType = {
  type: 'object' as const,
  value: null as null | TilejsonResult,
  validate: (value: TilejsonResult, propType) =>
    (propType.optional && value === null) ||
    (typeof value === 'object' &&
      Array.isArray(value.tiles) &&
      value.tiles.every(url => typeof url === 'string')),
  compare: 2,
  async: true
};
