// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  makeSyntheticTaxiPositions,
  makeTaxiZones,
  PAUL_TAYLOR_POINT_COUNT
} from '../../showcase/billion-point-spatial-atlas/spatial-atlas-data';
import {
  assertLongitudeLatitudeTaxiResidentWindow,
  getSpatialAtlasTaxiSourceRow
} from '../../showcase/billion-point-spatial-atlas/taxi-atlas-data';
import {
  getTaxiLongitudeLatitude,
  projectTaxiLongitudeLatitude,
  TAXI_LOCAL_LATITUDE_SCALE,
  TAXI_LOCAL_LONGITUDE_SCALE,
  TAXI_PROJECTION_ORIGIN
} from '../../showcase/billion-point-spatial-atlas/taxi-coordinate-space';
import type {TaxiPointResidentWindow} from '../../showcase/billion-point-spatial-atlas/taxi-resident-window';
import type {TaxiPointSourceTelemetry} from '../../showcase/billion-point-spatial-atlas/taxi-source';

export const TAXI_POINT_COUNT = 1_000_000;
export const TAXI_CORPUS_POINT_COUNT = PAUL_TAYLOR_POINT_COUNT;
export const TAXI_GRID_SIZE = [256, 256] as const;

const TAXI_GENERATION_CHUNK_SIZE = 20_000;
const TAXI_SOURCE_BOUNDS_PADDING = 0.002;

export {
  assertLongitudeLatitudeTaxiResidentWindow,
  getSpatialAtlasTaxiSourceRow,
  makeSpatialAtlasTaxiDataFromResidentWindow,
  makeSyntheticSpatialAtlasTaxiData,
  type SpatialAtlasTaxiData
} from '../../showcase/billion-point-spatial-atlas/taxi-atlas-data';
export {
  assertLongitudeLatitudeTaxiMetadata,
  getTaxiLocalXY,
  getTaxiLongitudeLatitude,
  projectTaxiLongitudeLatitude,
  TAXI_LOCAL_LATITUDE_SCALE,
  TAXI_LOCAL_LONGITUDE_SCALE,
  TAXI_PROJECTION_ORIGIN
} from '../../showcase/billion-point-spatial-atlas/taxi-coordinate-space';

export type LuSpatialTaxiData = {
  pointCount: number;
  corpusPointCount: number;
  longitudeLatitudes: Float32Array;
  sourceBounds: readonly [number, number, number, number];
  projectedBounds: readonly [number, number, number, number];
  sourceRowIndices?: Float64Array;
  sourceKind: 'synthetic' | 'packed';
  sourceLabel: string;
  sourceTelemetry?: TaxiPointSourceTelemetry;
};

export type LuSpatialTaxiDataGenerationOptions = {
  chunkSize?: number;
  onProgress?: (processedPointCount: number, totalPointCount: number) => void;
  signal?: AbortSignal;
};

export type TaxiZonePreset = {
  id: number;
  name: string;
  borough: string;
  center: readonly [number, number];
  zoom: number;
};

/** Builds a longitude/latitude resident window from the atlas' deterministic public fixture. */
export function makeLuSpatialTaxiData(pointCount = TAXI_POINT_COUNT): LuSpatialTaxiData {
  const longitudeLatitudes = new Float32Array(pointCount * 2);
  const sourceBounds = [Infinity, Infinity, -Infinity, -Infinity];

  for (let firstPointIndex = 0; firstPointIndex < pointCount; ) {
    const chunkPointCount = Math.min(TAXI_GENERATION_CHUNK_SIZE, pointCount - firstPointIndex);
    appendTaxiPositionChunk(longitudeLatitudes, sourceBounds, firstPointIndex, chunkPointCount);
    firstPointIndex += chunkPointCount;
  }

  return makeTaxiDataFromBounds(pointCount, longitudeLatitudes, sourceBounds);
}

/** Generates deterministic taxi rows progressively without monopolizing the browser main thread. */
export async function makeLuSpatialTaxiDataAsync(
  pointCount = TAXI_POINT_COUNT,
  options: LuSpatialTaxiDataGenerationOptions = {}
): Promise<LuSpatialTaxiData> {
  const {onProgress, signal} = options;
  const chunkSize = Math.max(1, Math.floor(options.chunkSize ?? TAXI_GENERATION_CHUNK_SIZE));
  const longitudeLatitudes = new Float32Array(pointCount * 2);
  const sourceBounds = [Infinity, Infinity, -Infinity, -Infinity];

  signal?.throwIfAborted();
  onProgress?.(0, pointCount);

  for (let firstPointIndex = 0; firstPointIndex < pointCount; ) {
    await yieldTaxiGeneration(signal);
    signal?.throwIfAborted();

    const chunkPointCount = Math.min(chunkSize, pointCount - firstPointIndex);
    appendTaxiPositionChunk(longitudeLatitudes, sourceBounds, firstPointIndex, chunkPointCount);
    firstPointIndex += chunkPointCount;
    onProgress?.(firstPointIndex, pointCount);
  }

  signal?.throwIfAborted();
  return makeTaxiDataFromBounds(pointCount, longitudeLatitudes, sourceBounds);
}

function appendTaxiPositionChunk(
  longitudeLatitudes: Float32Array,
  sourceBounds: number[],
  firstPointIndex: number,
  pointCount: number
): void {
  const localPositions = makeSyntheticTaxiPositions(pointCount, firstPointIndex);

  for (let localPointIndex = 0; localPointIndex < pointCount; localPointIndex++) {
    const localOffset = localPointIndex * 3;
    const longitudeLatitudeOffset = (firstPointIndex + localPointIndex) * 2;
    const longitude =
      localPositions[localOffset] / TAXI_LOCAL_LONGITUDE_SCALE + TAXI_PROJECTION_ORIGIN[0];
    const latitude =
      localPositions[localOffset + 1] / TAXI_LOCAL_LATITUDE_SCALE + TAXI_PROJECTION_ORIGIN[1];
    longitudeLatitudes[longitudeLatitudeOffset] = longitude;
    longitudeLatitudes[longitudeLatitudeOffset + 1] = latitude;
    sourceBounds[0] = Math.min(sourceBounds[0], longitude);
    sourceBounds[1] = Math.min(sourceBounds[1], latitude);
    sourceBounds[2] = Math.max(sourceBounds[2], longitude);
    sourceBounds[3] = Math.max(sourceBounds[3], latitude);
  }
}

function makeTaxiDataFromBounds(
  pointCount: number,
  longitudeLatitudes: Float32Array,
  sourceBounds: number[]
): LuSpatialTaxiData {
  const projectionSourceBounds = makeProjectionSourceBounds(sourceBounds);
  const projectedCorners = [
    projectTaxiLongitudeLatitude([sourceBounds[0], sourceBounds[1]]),
    projectTaxiLongitudeLatitude([sourceBounds[0], sourceBounds[3]]),
    projectTaxiLongitudeLatitude([sourceBounds[2], sourceBounds[1]]),
    projectTaxiLongitudeLatitude([sourceBounds[2], sourceBounds[3]])
  ];
  const projectedBounds = [Infinity, Infinity, -Infinity, -Infinity];

  for (const [projectedX, projectedY] of projectedCorners) {
    projectedBounds[0] = Math.min(projectedBounds[0], projectedX);
    projectedBounds[1] = Math.min(projectedBounds[1], projectedY);
    projectedBounds[2] = Math.max(projectedBounds[2], projectedX);
    projectedBounds[3] = Math.max(projectedBounds[3], projectedY);
  }

  const padding = 0.25;
  return {
    pointCount,
    corpusPointCount: TAXI_CORPUS_POINT_COUNT,
    longitudeLatitudes,
    sourceBounds: projectionSourceBounds,
    projectedBounds: [
      projectedBounds[0] - padding,
      projectedBounds[1] - padding,
      projectedBounds[2] + padding,
      projectedBounds[3] + padding
    ],
    sourceKind: 'synthetic',
    sourceLabel: 'Synthetic public-sample expansion'
  };
}

function makeProjectionSourceBounds(
  sourceBounds: readonly number[]
): readonly [number, number, number, number] {
  const longitudeExtent =
    Math.max(
      TAXI_PROJECTION_ORIGIN[0] - sourceBounds[0],
      sourceBounds[2] - TAXI_PROJECTION_ORIGIN[0]
    ) + TAXI_SOURCE_BOUNDS_PADDING;
  const latitudeExtent =
    Math.max(
      TAXI_PROJECTION_ORIGIN[1] - sourceBounds[1],
      sourceBounds[3] - TAXI_PROJECTION_ORIGIN[1]
    ) + TAXI_SOURCE_BOUNDS_PADDING;
  const projectionSourceBounds = [
    TAXI_PROJECTION_ORIGIN[0] - longitudeExtent,
    TAXI_PROJECTION_ORIGIN[1] - latitudeExtent,
    TAXI_PROJECTION_ORIGIN[0] + longitudeExtent,
    TAXI_PROJECTION_ORIGIN[1] + latitudeExtent
  ] as const;
  return projectionSourceBounds;
}

function yieldTaxiGeneration(signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      signal?.removeEventListener('abort', abortGeneration);
      resolve();
    }, 0);
    const abortGeneration = () => {
      clearTimeout(timeout);
      reject(signal?.reason ?? new DOMException('Taxi generation was cancelled', 'AbortError'));
    };

    signal?.addEventListener('abort', abortGeneration, {once: true});
  });
}

/**
 * Converts an explicitly WGS84 longitude/latitude resident window into deck.gl taxi data.
 *
 * Packed sources remain coordinate-neutral until this adapter. CRS84 and the browser convention
 * for WGS84/EPSG:4326 are interpreted as X=longitude and Y=latitude.
 */
export function makeLuSpatialTaxiDataFromResidentWindow(
  window: TaxiPointResidentWindow
): LuSpatialTaxiData {
  assertLongitudeLatitudeTaxiResidentWindow(window);

  const sourceBounds = [Infinity, Infinity, -Infinity, -Infinity];
  const projectedBounds = [Infinity, Infinity, -Infinity, -Infinity];
  let finiteRowCount = 0;
  for (let rowIndex = 0; rowIndex < window.rowCount; rowIndex++) {
    const longitude = window.positions[rowIndex * 2];
    const latitude = window.positions[rowIndex * 2 + 1];
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) continue;
    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      throw new Error(
        `Taxi source row ${window.sourceRowIndices[rowIndex]} is outside longitude/latitude bounds`
      );
    }
    sourceBounds[0] = Math.min(sourceBounds[0], longitude);
    sourceBounds[1] = Math.min(sourceBounds[1], latitude);
    sourceBounds[2] = Math.max(sourceBounds[2], longitude);
    sourceBounds[3] = Math.max(sourceBounds[3], latitude);
    const [projectedX, projectedY] = projectTaxiLongitudeLatitude([longitude, latitude]);
    projectedBounds[0] = Math.min(projectedBounds[0], projectedX);
    projectedBounds[1] = Math.min(projectedBounds[1], projectedY);
    projectedBounds[2] = Math.max(projectedBounds[2], projectedX);
    projectedBounds[3] = Math.max(projectedBounds[3], projectedY);
    finiteRowCount++;
  }
  if (finiteRowCount === 0) {
    throw new Error('Taxi resident window does not contain a finite longitude/latitude row');
  }

  const padding = 0.25;
  return {
    pointCount: window.rowCount,
    corpusPointCount: window.sourceRowCount,
    longitudeLatitudes: window.positions,
    sourceBounds: makeProjectionSourceBounds(sourceBounds),
    projectedBounds: [
      projectedBounds[0] - padding,
      projectedBounds[1] - padding,
      projectedBounds[2] + padding,
      projectedBounds[3] + padding
    ],
    sourceRowIndices: window.sourceRowIndices,
    sourceKind: 'packed',
    sourceLabel: 'Packed row-group source',
    sourceTelemetry: window.telemetry
  };
}

/** Taxi-zone centers used as navigation and radius-query presets. */
export function makeTaxiZonePresets(): readonly TaxiZonePreset[] {
  return makeTaxiZones().map(zone => {
    const localWidth = zone.bounds[2] - zone.bounds[0];
    const localHeight = zone.bounds[3] - zone.bounds[1];
    const [longitude, latitude] = getTaxiLongitudeLatitude([
      (zone.bounds[0] + zone.bounds[2]) * 0.5,
      (zone.bounds[1] + zone.bounds[3]) * 0.5
    ]);
    const maximumExtent = Math.max(
      localWidth / TAXI_LOCAL_LONGITUDE_SCALE,
      localHeight / TAXI_LOCAL_LATITUDE_SCALE
    );
    return {
      id: zone.id,
      name: zone.name,
      borough: zone.borough,
      center: [longitude, latitude],
      zoom: Math.max(11, Math.min(16, Math.log2(0.18 / Math.max(maximumExtent, 0.002)) + 12))
    };
  });
}

export function getTaxiPoint(
  data: LuSpatialTaxiData,
  pointIndex: number
): {
  longitude: number;
  latitude: number;
  sourceRowIndex: number;
  sourceKind: LuSpatialTaxiData['sourceKind'];
} | null {
  if (!Number.isSafeInteger(pointIndex) || pointIndex < 0 || pointIndex >= data.pointCount) {
    return null;
  }
  const sourceRowIndex = getSpatialAtlasTaxiSourceRow(data, pointIndex);
  if (sourceRowIndex === null) return null;
  return {
    longitude: data.longitudeLatitudes[pointIndex * 2],
    latitude: data.longitudeLatitudes[pointIndex * 2 + 1],
    sourceRowIndex,
    sourceKind: data.sourceKind
  };
}
