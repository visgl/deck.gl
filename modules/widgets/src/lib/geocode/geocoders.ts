// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {type Geocoder} from './geocoder';

const GOOGLE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const MAPBOX_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
const OPENCAGE_API_URL = 'https://api.opencagedata.com/geocode/v1/json';

/**
 * A geocoder that uses the google geocoding service
 * @note Requires an API key from Google
 * @see https://developers.google.com/maps/documentation/geocoding/get-api-key
 */
export const GoogleGeocoder = {
  name: 'google',
  requiresApiKey: true,
  async geocode(
    address: string,
    apiKey: string
  ): Promise<{longitude: number; latitude: number} | null> {
    const encodedAddress = encodeURIComponent(address);
    const json = await fetchJson(`${GOOGLE_URL}?address=${encodedAddress}&key=${apiKey}`);

    switch (json.status) {
      case 'OK':
        const loc = json.results.length > 0 && json.results[0].geometry.location;
        return loc ? {longitude: loc.lng, latitude: loc.lat} : null;
      default:
        throw new Error(`Google Geocoder failed: ${json.status}`);
    }
  }
} as const satisfies Geocoder;

/**
 * A geocoder that uses the google geocoding service
 * @note Requires an API key from Mapbox
 * @see https://docs.mapbox.com/api/search/geocoding/
 */
export const MapboxGeocoder = {
  name: 'google',
  requiresApiKey: true,
  async geocode(
    address: string,
    apiKey: string
  ): Promise<{longitude: number; latitude: number} | null> {
    const encodedAddress = encodeURIComponent(address);
    const json = await fetchJson(`${MAPBOX_URL}/${encodedAddress}.json?access_token=${apiKey}`);

    if (Array.isArray(json.features) && json.features.length > 0) {
      const center = json.features[0].center;
      if (Array.isArray(center) && center.length >= 2) {
        return {longitude: center[0], latitude: center[1]};
      }
    }
    return null;
  }
} as const satisfies Geocoder;

/**
 * A geocoder that uses the google geocoding service
 * @note Requires an API key from OpenCageData
 * @see https://opencagedata.com/api
 */
export const OpenCageGeocoder = {
  name: 'opencage',
  requiresApiKey: true,
  async geocode(
    address: string,
    key: string
  ): Promise<{longitude: number; latitude: number} | null> {
    const encodedAddress = encodeURIComponent(address);
    const data = await fetchJson(`${OPENCAGE_API_URL}?q=${encodedAddress}&key=${key}`);
    if (Array.isArray(data.results) && data.results.length > 0) {
      const geometry = data.results[0].geometry;
      return {longitude: geometry.lng, latitude: geometry.lat};
    }
    return null;
  }
} as const satisfies Geocoder;

/**
 * A geocoder adapter that wraps the browser's geolocation API. Always returns the user's current location.
 * @note Not technically a geocoder, but a geolocation service that provides a source of locations.
 * @note The user must allow location access for this to work.
 */
export const CurrentLocationGeocoder = {
  name: 'current',
  requiresApiKey: false,
  /** Attempt to call browsers geolocation API */
  async geocode(): Promise<{longitude: number; latitude: number} | null> {
    if (!navigator.geolocation) {
      throw new Error('Geolocation not supported');
    }
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        /** @see https://developer.mozilla.org/docs/Web/API/GeolocationPosition */
        (position: GeolocationPosition) => {
          const {longitude, latitude} = position.coords;
          resolve({longitude, latitude});
        },
        /** @see https://developer.mozilla.org/docs/Web/API/GeolocationPositionError */
        (error: GeolocationPositionError) => reject(new Error(error.message))
      );
    });
  }
} as const satisfies Geocoder;

/** Fetch JSON, catching HTTP errors */
async function fetchJson(url: string): Promise<any> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    // Annoyingly, fetch reports some errors (e.g. CORS) using excpetions, not response.ok
    throw new Error(`CORS error? ${error}. ${url}: `);
  }
  if (!response.ok) {
    throw new Error(`${response.statusText}. ${url}: `);
  }
  const data = await response.json();
  if (!data) {
    throw new Error(`No data returned. ${url}`);
  }
  return data;
}

/**
 * Parse a coordinate string.
 * Supports comma- or semicolon-separated values.
 * Heuristically determines which value is longitude and which is latitude.
 */
export const CoordinatesGeocoder = {
  name: 'coordinates',
  requiresApiKey: false,
  placeholderLocation: `-122.45, 37.8 or 37°48'N, 122°27'W`,
  async geocode(address: string): Promise<{longitude: number; latitude: number} | null> {
    return parseCoordinates(address) || null;
  }
} as const satisfies Geocoder;

/**
 * Parse an input string for coordinates.
 * Supports comma- or semicolon-separated values.
 * Heuristically determines which value is longitude and which is latitude.
 */
function parseCoordinates(input) {
  input = input.trim();
  const parts = input.split(/[,;]/).map(p => p.trim());
  if (parts.length < 2) return null;
  const first = parseCoordinatePart(parts[0]);
  const second = parseCoordinatePart(parts[1]);
  if (first === null || second === null) return null;
  // Use a heuristic:
  // If one number exceeds 90 in absolute value, it's likely a longitude.
  if (Math.abs(first) > 90 && Math.abs(second) <= 90) {
    return {longitude: first, latitude: second};
  } else if (Math.abs(second) > 90 && Math.abs(first) <= 90) {
    return {longitude: second, latitude: first};
  }
  // If both are <= 90, assume order: latitude, longitude.
  return {latitude: first, longitude: second};
}

/**
 * Parse a single coordinate part (which may be in decimal or DMS format).
 */
function parseCoordinatePart(s: string): number | null {
  s = s.trim();
  // If the string contains a degree symbol or similar markers, use DMS parsing.
  if (s.includes('°') || s.includes("'") || s.includes('"')) {
    const value = dmsToDecimal(s);
    return isNaN(value) ? null : value;
  }
  // Otherwise, check for a cardinal letter and remove it.
  let sign = 1;
  if (/[SW]/i.test(s)) sign = -1;
  s = s.replace(/[NSEW]/gi, '');
  const value = parseFloat(s);
  return isNaN(value) ? null : sign * value;
}

/** Convert a DMS string (e.g. "37°48'00\"N") to decimal degrees. */
function dmsToDecimal(s: string): number {
  // A simple regex to extract degrees, minutes, seconds and direction.
  const regex = /(\d+)[°d]\s*(\d+)?['′m]?\s*(\d+(?:\.\d+)?)?[\"″s]?\s*([NSEW])?/i;
  const match = s.match(regex);
  if (!match) return NaN;
  const degrees = parseFloat(match[1]) || 0;
  const minutes = parseFloat(match[2]) || 0;
  const seconds = parseFloat(match[3]) || 0;
  const direction = match[4] || '';
  let dec = degrees + minutes / 60 + seconds / 3600;
  if (/[SW]/i.test(direction)) {
    dec = -dec;
  }
  return dec;
}
