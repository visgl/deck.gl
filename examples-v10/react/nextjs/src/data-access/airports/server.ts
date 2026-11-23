// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import 'server-only';

import {cacheTag} from 'next/cache';
import type {AirportFeature, AirportsGeoJSON} from './types';

const API_URL =
  'https://services6.arcgis.com/ssFJjBXIUyZDrSYZ/arcgis/rest/services/US_Airport/FeatureServer/0/query';

/** Quotes a value as an SQL string literal, so input such as O'Hare stays valid SQL. */
function sqlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

/**
 * Reads a query response. ArcGIS reports a failed or rate-limited query in the body with HTTP
 * status 200, so check for an `error` member as well as the status.
 */
async function readResponse(response: Response, what: string): Promise<AirportsGeoJSON> {
  if (!response.ok) {
    throw new Error(`Failed to fetch ${what}: ${response.statusText}`);
  }
  const data = (await response.json()) as
    | AirportsGeoJSON
    | {error: {code: number; message: string}};
  if ('error' in data) {
    throw new Error(`Failed to fetch ${what}: ${data.error.message || data.error.code}`);
  }
  return data;
}

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
    const pattern = sqlString(`%${search.toUpperCase()}%`);
    whereClause = `(NAME LIKE ${pattern} OR IDENT LIKE ${pattern})`;
  }

  const params = new URLSearchParams({
    f: 'geojson',
    outFields: '*',
    where: whereClause
  });

  const data = await readResponse(await fetch(`${API_URL}?${params.toString()}`), 'airports');
  return data.features;
}

export async function airportById(id: string): Promise<AirportFeature | null> {
  'use cache';
  cacheTag('airports', `airport-${id}`);

  const whereClause = `IDENT=${sqlString(id)}`;
  const params = new URLSearchParams({
    f: 'geojson',
    outFields: '*',
    where: whereClause
  });

  const data = await readResponse(await fetch(`${API_URL}?${params.toString()}`), `airport ${id}`);
  return data.features[0] ?? null;
}
