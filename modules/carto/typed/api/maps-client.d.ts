/**
 * Maps API Client for Maps API v1 and Maps API v2
 */
import {ClassicCredentials} from '../config';
import {MapType} from './maps-api-common';
export declare const CONNECTIONS: {
  BIGQUERY: string;
  CARTO: string;
};
/**
 * Obtain a TileJson from Maps API v1 and v2
 */
export declare function getDataV2({
  type,
  source,
  credentials
}: {
  type: MapType;
  source: string;
  credentials?: Partial<ClassicCredentials>;
}): Promise<any>;
// # sourceMappingURL=maps-client.d.ts.map
