import type {Feature} from 'geojson';
import type {Format, MapInstantiation, QueryParameters} from '../api/types';

export type SourceRequiredOptions = {
  /** Carto platform access token. */
  accessToken: string;

  /** Data warehouse connection name in Carto platform. */
  connectionName: string;
};

export type SourceOptionalOptions = {
  /**
   * Base URL of the CARTO Maps API.
   *
   * Example for account located in EU-west region: `https://gcp-eu-west1.api.carto.com`
   *
   * @default https://gcp-us-east1.api.carto.com
   */
  apiBaseUrl: string;

  /**
   * Custom HTTP headers added to map instantiation and data requests.
   */
  headers: Record<string, string>;

  /**
   * Cache buster value returned by map instantiation.
   *
   * Carto source saves `cache` value of map instantiation response in `cache.value`, so it can be used to
   * check if underlying map data has changed between distinct source requests.
   */
  cache?: {value?: number};

  clientId: string;
  /** @deprecated  use `query` instead **/
  format: Format;
};

export type SourceOptions = SourceRequiredOptions & Partial<SourceOptionalOptions>;

export type AggregationOptions = {
  /**
   * Defines the aggregation expressions that will be calculated from the resulting columns on each grid cell.
   *
   * Example:
   *
   *     sum(pop) as total_population, avg(rev) as average_revenue
   */
  aggregationExp: string;

  /**
   * Defines the tile aggregation resolution.
   *
   * @default 6 for quadbin and 4 for h3 sources
   */
  aggregationResLevel?: number;
};

export type QuerySourceOptions = {
  /**
   * The column name and the type of geospatial support.
   *
   * If not present, defaults to `'geom'` for generic queries, `'quadbin'` for Quadbin sources and `'h3'` for H3 sources.
   */
  spatialDataColumn?: string;

  /** SQL query. */
  sqlQuery: string;

  /**
   * Values for named or positional paramteres in the query.
   *
   * The way query parameters are determined by data warehouse.
   *
   *  * BigQuery has named query parameters, specified with a dictionary, and referenced by key (`@key`)
   *
   *     ```
   *     sqlQuery: "SELECT * FROM carto-demo-data.demo_tables.retail_stores WHERE storetype = ⁣@type AND revenue > ⁣@minRevenue"
   *     queryParameters: { type: 'Supermarket', minRevenue: 1000000 }
   *     ```
   * * Snowflake supports positional parameters, in the form `:1`, `:2`, etc.
   *
   *     ```
   *     sqlQuery: "SELECT * FROM demo_db.public.import_retail_stores WHERE storetype = :2 AND revenue > :1
   *     queryParameters: [100000, "Supermarket"]
   *     ```
   * * Postgres and Redhisft supports positional parameters, but in the form `$1`, `$2`, etc.
   *
   *     ```
   *     sqlQuery: "SELECT * FROM carto_demo_data.demo_tables.retail_stores WHERE storetype = $2 AND revenue > $1
   *     queryParameters: [100000, "Supermarket"]
   *     ```
   */
  queryParameters?: QueryParameters;
};

export type TableSourceOptions = {
  /**
   * Fully qualified name of table.
   */
  tableName: string;

  /**
   * Columns to retrieve from the table.
   *
   * If not specified, all columns are returned.
   */
  columns?: string[];

  /**
   * The column name and the type of geospatial support.
   *
   * If not present, defaults to `'geom'` for generic tables, `'quadbin'` for Quadbin sources and `'h3'` for H3 sources.
   */
  spatialDataColumn?: string;
};

export type TilesetSourceOptions = {
  /**
   * Fully qualified name of tileset.
   */
  tableName: string;
};

export type SpatialDataType = 'geo' | 'h3' | 'quadbin';

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
