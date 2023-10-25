import type {SourceOptionalOptions} from './types';

/* eslint-disable camelcase */
export const SOURCE_DEFAULTS: SourceOptionalOptions = {
  apiBaseUrl: 'https://gcp-us-east1.api.carto.com',
  clientId: 'deck-gl-carto',
  format: 'tilejson',
  headers: {}
};

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
