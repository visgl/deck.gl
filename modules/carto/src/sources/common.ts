import {MapInstantiation, TileFormat, QueryParameters} from '../api/maps-api-common';

export type CartoSourceRequiredOptions = {
  accessToken: string;
  connectionName: string;
};

export type CartoSourceOptionalOptions = {
  apiBaseUrl: string;
  clientId: string; // Default 'deck-gl-carto'
  formatTiles: TileFormat;
  headers: Record<string, string>;
  mapsUrl?: string; // Default `${apiBaseUrl}/v3/maps`
};

export type CartoAggregationOptions = {
  aggregationExp?: string;
  aggregationResLevel?: number;
};

export type CartoQuerySourceOptions = {
  spatialDataColumn?: string;
  sqlQuery: string;
  queryParameters?: QueryParameters;
};

export type CartoTilesetSourceOptions = {
  tableName: string;
};

export const SOURCE_DEFAULTS: CartoSourceOptionalOptions = {
  apiBaseUrl: 'https://gcp-us-east1.api.carto.com',
  clientId: 'deck-gl-carto',
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

export type CartoTilejsonResult = Tilejson & {accessToken: string};

export const DEFAULT_CLIENT = 'deck-gl-carto';
export const V3_MINOR_VERSION = '3.2';
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
  value: null as null | CartoTilejsonResult,
  validate: (value: CartoTilejsonResult, propType) =>
    (propType.optional && value === null) ||
    (typeof value === 'object' &&
      Array.isArray(value.tiles) &&
      value.tiles.every(url => typeof url === 'string')),
  compare: 2,
  async: true
};
