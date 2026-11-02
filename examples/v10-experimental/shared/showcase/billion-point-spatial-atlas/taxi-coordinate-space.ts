// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {TaxiPointSourceMetadata} from './taxi-source';

/** Longitude/latitude origin shared by the Atlas and deck.gl taxi examples. */
export const TAXI_PROJECTION_ORIGIN = [-73.97, 40.75] as const;

/** Local Atlas X units per degree of longitude. */
export const TAXI_LOCAL_LONGITUDE_SCALE = 8;

/** Local Atlas Y units per degree of latitude. */
export const TAXI_LOCAL_LATITUDE_SCALE = 9;

const KILOMETRES_PER_DEGREE = 40_000 / 360;
const DEGREES_TO_RADIANS = Math.PI / 180;

/** Rejects source-XY data until its manifest explicitly declares longitude/latitude coordinates. */
export function assertLongitudeLatitudeTaxiMetadata(metadata: TaxiPointSourceMetadata): void {
  const coordinateReferenceSystem = metadata.coordinateSpace.crs?.trim().toUpperCase();
  if (
    coordinateReferenceSystem !== 'OGC:CRS84' &&
    coordinateReferenceSystem !== 'CRS84' &&
    coordinateReferenceSystem !== 'EPSG:4326' &&
    coordinateReferenceSystem !== 'WGS84'
  ) {
    throw new Error(
      'luSpatial taxi sources must explicitly declare OGC:CRS84 or WGS84/EPSG:4326 longitude/latitude coordinates'
    );
  }
}

/** Converts longitude/latitude into the local XY coordinate space used by the Spatial Atlas. */
export function getTaxiLocalXY(
  longitudeLatitude: readonly [number, number]
): readonly [number, number] {
  return [
    (longitudeLatitude[0] - TAXI_PROJECTION_ORIGIN[0]) * TAXI_LOCAL_LONGITUDE_SCALE,
    (longitudeLatitude[1] - TAXI_PROJECTION_ORIGIN[1]) * TAXI_LOCAL_LATITUDE_SCALE
  ];
}

/** Converts Spatial Atlas local XY coordinates back to longitude/latitude. */
export function getTaxiLongitudeLatitude(
  localXY: readonly [number, number]
): readonly [number, number] {
  return [
    localXY[0] / TAXI_LOCAL_LONGITUDE_SCALE + TAXI_PROJECTION_ORIGIN[0],
    localXY[1] / TAXI_LOCAL_LATITUDE_SCALE + TAXI_PROJECTION_ORIGIN[1]
  ];
}

/** Mirrors {@link GPUSinusoidalProjection} for tiny mutable query inputs. */
export function projectTaxiLongitudeLatitude(
  longitudeLatitude: readonly [number, number]
): readonly [number, number] {
  const [longitude, latitude] = longitudeLatitude;
  const midpointLatitudeRadians = (latitude + TAXI_PROJECTION_ORIGIN[1]) * 0.5 * DEGREES_TO_RADIANS;
  return [
    (TAXI_PROJECTION_ORIGIN[0] - longitude) *
      KILOMETRES_PER_DEGREE *
      Math.cos(midpointLatitudeRadians),
    (TAXI_PROJECTION_ORIGIN[1] - latitude) * KILOMETRES_PER_DEGREE
  ];
}
