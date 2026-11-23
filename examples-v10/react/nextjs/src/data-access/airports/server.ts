// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import 'server-only';

import {cacheTag} from 'next/cache';
import type {AirportFeature, AirportsGeoJSON} from './types';

const API_URL =
  'https://services6.arcgis.com/ssFJjBXIUyZDrSYZ/arcgis/rest/services/US_Airport/FeatureServer/0/query';

interface AirportsOptions {
  search?: string;
}

export async function airports(options: AirportsOptions = {}): Promise<AirportFeature[]> {
  'use cache';
  cacheTag('airports');

  const {search} = options;

  // Build where clause for server-side filtering
  let whereClause = '1=1';
  if (search) {
    whereClause = `(NAME LIKE '%${search.toUpperCase()}%' OR IDENT LIKE '%${search.toUpperCase()}%')`;
  }

  const params = new URLSearchParams({
    f: 'geojson',
    outFields: '*',
    where: whereClause
  });

  const response = await fetch(`${API_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch airports: ${response.statusText}`);
  }

  const data = (await response.json()) as AirportsGeoJSON;
  return data.features;
}

export async function airportById(id: string): Promise<AirportFeature | null> {
  'use cache';
  cacheTag('airports', `airport-${id}`);

  const whereClause = `IDENT='${id}'`;
  const params = new URLSearchParams({
    f: 'geojson',
    outFields: '*',
    where: whereClause
  });

  const response = await fetch(`${API_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch airport ${id}: ${response.statusText}`);
  }

  const data = (await response.json()) as AirportsGeoJSON;
  return data.features[0] ?? null;
}
