/**
 * Maps API Client for Carto 3
 */
import {CloudNativeCredentials} from '../config';
import {
  Format,
  MapInstantiation,
  MapType,
  QueryParameters,
  SchemaField,
  TileFormat
} from './maps-api-common';
export declare type Headers = Record<string, string>;
declare type FetchLayerDataParams = {
  type: MapType;
  source: string;
  connection: string;
  credentials: CloudNativeCredentials;
  geoColumn?: string;
  columns?: string[];
  clientId?: string;
  format?: Format;
  formatTiles?: TileFormat;
  headers?: Headers;
  aggregationExp?: string;
  aggregationResLevel?: number;
  queryParameters?: QueryParameters;
};
export declare function mapInstantiation({
  type,
  source,
  connection,
  credentials,
  geoColumn,
  columns,
  clientId,
  headers,
  aggregationExp,
  aggregationResLevel,
  queryParameters
}: FetchLayerDataParams): Promise<MapInstantiation>;
export interface FetchLayerDataResult {
  data: any;
  format?: Format;
  schema: SchemaField[];
}
export declare function fetchLayerData({
  type,
  source,
  connection,
  credentials,
  geoColumn,
  columns,
  format,
  formatTiles,
  clientId,
  headers,
  aggregationExp,
  aggregationResLevel,
  queryParameters
}: FetchLayerDataParams): Promise<FetchLayerDataResult>;
export declare function fetchMap({
  cartoMapId,
  clientId,
  credentials,
  headers,
  autoRefresh,
  onNewData
}: {
  cartoMapId: string;
  clientId: string;
  credentials?: CloudNativeCredentials;
  headers?: Headers;
  autoRefresh?: number;
  onNewData?: (map: any) => void;
}): Promise<{
  stopAutoRefresh: () => void;
  id: any;
  title: any;
  description: any;
  createdAt: any;
  updatedAt: any;
  initialViewState: any;
  mapStyle: any;
  token: any;
  layers: import('@deck.gl/core').Layer<{}>[];
}>;
export {};
// # sourceMappingURL=maps-v3-client.d.ts.map
