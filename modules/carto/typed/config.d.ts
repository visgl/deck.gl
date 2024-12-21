export declare const defaultClassicCredentials: {
  readonly apiKey: 'default_public';
  readonly region: 'us';
  readonly username: 'public';
};
export declare const defaultCloudNativeCredentials: {
  readonly apiBaseUrl: 'https://gcp-us-east1.api.carto.com';
};
export interface ClassicCredentials {
  apiVersion: 'v1' | 'v2';
  apiKey: string;
  region: string;
  username: string;
  mapsUrl?: string;
}
export interface CloudNativeCredentials {
  apiVersion: 'v3';
  apiBaseUrl: string;
  accessToken?: string;
  mapsUrl?: string;
}
export declare type Credentials = ClassicCredentials | CloudNativeCredentials;
export declare function setDefaultCredentials({apiVersion, ...rest}: Partial<Credentials>): void;
export declare function getDefaultCredentials(): Credentials;
export declare type V3Endpoint = 'maps' | 'stats';
export declare function buildMapsUrlFromBase(apiBaseUrl: string): string;
export declare function buildStatsUrlFromBase(apiBaseUrl: string): string;
// # sourceMappingURL=config.d.ts.map
