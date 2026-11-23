// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Airport, AirportsResponse} from './types';

const API_URL =
  'https://services6.arcgis.com/ssFJjBXIUyZDrSYZ/arcgis/rest/services/US_Airport/FeatureServer/0/query';

/**
 * Fetch airports from FAA API with optional search filtering
 */
export async function fetchAirports(search?: string): Promise<Airport[]> {
  let whereClause = '1=1';
  if (search && search.trim()) {
    const searchTerm = search.trim().toUpperCase();
    whereClause = `UPPER(NAME) LIKE '%${searchTerm}%' OR UPPER(CITY) LIKE '%${searchTerm}%' OR UPPER(STATE) LIKE '%${searchTerm}%'`;
  }

  const url = new URL(API_URL);
  url.searchParams.set('outFields', '*');
  url.searchParams.set('where', whereClause);
  url.searchParams.set('f', 'geojson');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch airports: ${response.statusText}`);
  }

  const data: AirportsResponse = await response.json();

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

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch airport: ${response.statusText}`);
  }

  const data: AirportsResponse = await response.json();

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
