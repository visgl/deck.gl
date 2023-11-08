import type {Feature} from 'geojson';
import type {Format, MapInstantiation, QueryParameters} from '../api/types';

export type SourceRequiredOptions = {
  accessToken: string;
  connectionName: string;
};

export type SourceOptionalOptions = {
  apiBaseUrl: string;
  cache?: {value?: number};
  clientId: string;
  /** @deprecated  use `query` instead **/
  format: Format;
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
export type QueryResult = {
  meta: {cacheHit: boolean; location: string; totalBytesProcessed: string};
  rows: Record<string, any>[];
  schema: {name: string; type: string}[];
};
