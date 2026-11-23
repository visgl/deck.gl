// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Airport, AirportsResponse, ArcGISErrorResponse} from './types';

const API_URL =
  'https://services6.arcgis.com/ssFJjBXIUyZDrSYZ/arcgis/rest/services/US_Airport/FeatureServer/0/query';

/**
 * Reads a query response. ArcGIS reports a failed or rate-limited query in the body with HTTP
 * status 200, so check for an `error` member as well as the status.
 */
async function readResponse(response: Response): Promise<AirportsResponse> {
  if (!response.ok) {
    throw new Error(`Failed to fetch airports: ${response.statusText}`);
  }
  const data: AirportsResponse | ArcGISErrorResponse = await response.json();
  if ('error' in data) {
    const {message, details} = data.error;
    throw new Error(
      `Failed to fetch airports: ${message || details?.join(' ') || data.error.code}`
    );
  }
  return data;
}

/**
 * Fetch airports from FAA API with optional search filtering
 */
export async function fetchAirports(search?: string): Promise<Airport[]> {
  let whereClause = '1=1';
  if (search && search.trim()) {
    // Quote the term as an SQL string literal, so a name such as O'Hare stays valid SQL.
    const searchTerm = search.trim().toUpperCase().replaceAll("'", "''");
    whereClause = `UPPER(NAME) LIKE '%${searchTerm}%' OR UPPER(CITY) LIKE '%${searchTerm}%' OR UPPER(STATE) LIKE '%${searchTerm}%'`;
  }

  const url = new URL(API_URL);
  url.searchParams.set('outFields', '*');
  url.searchParams.set('where', whereClause);
  url.searchParams.set('f', 'geojson');

  const data = await readResponse(await fetch(url.toString()));

  return data.features.map(feature => ({
    city: feature.properties.CITY,
    coordinates: feature.geometry.coordinates,
    id: feature.properties.OBJECTID,
    latitude: feature.properties.LATITUDE,
    longitude: feature.properties.LONGITUDE,
    name: feature.properties.NAME,
    state: feature.properties.STATE
  }));
}

/**
 * Fetch a single airport by ID
 */
export async function fetchAirportById(id: number): Promise<Airport | null> {
  const url = new URL(API_URL);
  url.searchParams.set('outFields', '*');
  url.searchParams.set('where', `OBJECTID=${id}`);
  url.searchParams.set('f', 'geojson');

  const data = await readResponse(await fetch(url.toString()));

  if (data.features.length === 0) {
    return null;
  }

  const feature = data.features[0];
  return {
    city: feature.properties.CITY,
    coordinates: feature.geometry.coordinates,
    id: feature.properties.OBJECTID,
    latitude: feature.properties.LATITUDE,
    longitude: feature.properties.LONGITUDE,
    name: feature.properties.NAME,
    state: feature.properties.STATE
  };
}
