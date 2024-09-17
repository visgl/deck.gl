export const DEFAULT_API_BASE_URL = 'https://gcp-us-east1.api.carto.com';
export const DEFAULT_CLIENT = 'deck-gl-carto';
export const V3_MINOR_VERSION = '3.4';

// Fastly default limit is 8192; leave some padding.
export let MAX_GET_LENGTH = 7000;

/**
 * Returns maximum URL character length. Above this limit, requests use POST.
 * Used to avoid browser and CDN limits.
 */
export function getRequestURLLimit(): number {
  return MAX_GET_LENGTH;
}

/**
 * Assigns maximum URL character length. Above this limit, requests use POST.
 * Used to avoid browser and CDN limits.
 */
export function setRequestURLLimit(limit: number): void {
  MAX_GET_LENGTH = limit;
}
