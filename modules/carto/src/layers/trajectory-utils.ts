// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {BinaryLineFeature} from '@loaders.gl/schema';
import {NumericProps} from './schema/spatialjson-utils';

/**
 * Normalize timestamp to Unix seconds format
 * @param timestamp - Either a Unix timestamp (number) or ISO string
 * @returns Unix timestamp in seconds
 */
export function normalizeTimestamp(timestamp: number | string): number {
  if (typeof timestamp === 'string') {
    // Convert ISO timestamp string to Unix time in seconds
    return new Date(timestamp).getTime() / 1000;
  }
  // Already a number, return as-is
  return timestamp;
}

export interface TileBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface TrajectoryPoint {
  index: number;
  timestamp: number;
  position: [number, number];
  trajectoryId: string | number;
}

export type ProcessedGeometry = BinaryLineFeature & {
  attributes: {
    getColor?: {value: Uint8Array; size: number; normalized: boolean};
    getTimestamps: {value: Float32Array; size: number};
  }
};

function isPointInTileBounds(bounds: TileBounds, point?: TrajectoryPoint): boolean {
  if (!point) return false;
  const [lon, lat] = point.position;
  return lon >= bounds.west && lon <= bounds.east && lat >= bounds.south && lat <= bounds.north;
}

/**
 * Extract trajectory and timestamp data from geometry, handling different data formats
 */
export function extractTrajectoryData(
  geometry: any,
  trajectoryIdColumn: string,
  timestampColumn: string,
  timestampRange?: {min: number | string; max: number | string}
): {tripIds: {value: any[]}; timestamps: {value: number[]}; properties?: any[]} {
  const {numericProps, properties} = geometry;

  // Handle trajectory IDs
  const tripIds = numericProps?.[trajectoryIdColumn] || {
    value: properties?.map((p: any) => p[trajectoryIdColumn]) || []
  };

  // Calculate timestamp normalization offset if timestampRange is provided
  let timestampOffset = 0;
  if (timestampRange) {
    timestampOffset = normalizeTimestamp(timestampRange.min);
  }

  // Handle timestamps - convert ISO strings to Unix time if needed and normalize
  const timestamps = numericProps?.[timestampColumn] || {
    value:
      properties?.map((p: any) => {
        const timestamp = p[timestampColumn];
        const unixTime = normalizeTimestamp(timestamp);
        // Normalize timestamp to avoid 32-bit float precision issues
        return unixTime - timestampOffset;
      }) || []
  };

  // Also normalize numeric timestamps if they exist
  if (numericProps?.[timestampColumn] && timestampOffset > 0) {
    timestamps.value = timestamps.value.map((t: number) => t - timestampOffset);
  }

  return {tripIds, timestamps, properties};
}

/**
 * Group trajectory points by trajectory ID and sort by timestamp
 */
export function groupAndSortTrajectoryPoints(
  geometry: any,
  tripIds: {value: any[]},
  timestamps: {value: number[]}
): Map<string | number, TrajectoryPoint[]> {
  const {positions} = geometry;
  const n = geometry.featureIds?.value?.length || 0;
  const trajectoryGroups = new Map();

  for (let i = 0; i < n; i++) {
    const trajectoryId = tripIds.value[i];
    const timestamp = timestamps.value[i];
    const position = positions.value.subarray(positions.size * i, positions.size * i + 2);

    if (!trajectoryGroups.has(trajectoryId)) {
      trajectoryGroups.set(trajectoryId, []);
    }

    trajectoryGroups.get(trajectoryId).push({
      index: i,
      timestamp,
      position,
      trajectoryId
    });
  }

  // Sort each trajectory by timestamp
  for (const points of trajectoryGroups.values()) {
    points.sort((a, b) => a.timestamp - b.timestamp);
  }

  return trajectoryGroups;
}

/**
 * Filter trajectory points by tile bounds and create line segments
 */
export function createTrajectorySegments(
  trajectoryGroups: Map<string | number, TrajectoryPoint[]>,
  tileBounds: TileBounds
): {validPoints: TrajectoryPoint[]; pathIndices: number[]} {
  const pathIndices: number[] = [];
  const validPoints: TrajectoryPoint[] = [];
  let currentIndex = 0;

  for (const points of trajectoryGroups.values()) {
    let trajectoryEntered = false;
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const nextPoint = points[i + 1];
      const pointInBounds = isPointInTileBounds(tileBounds, point);
      const nextPointInBounds = isPointInTileBounds(tileBounds, nextPoint);

      // Point is valid if it is in bounds or the next point is
      if (pointInBounds || nextPointInBounds) {
        if (!trajectoryEntered || !pointInBounds) {
          // Start new segment, either due to:
          // - New trajectory starting
          // - Entering bounds
          // Don't need to do anything for segment end, only start is marked
          pathIndices.push(currentIndex);
          trajectoryEntered = true;
        }

        // Add actual point to positions array
        validPoints.push(point);
        currentIndex++;
      }
    }
  }

  // Close last segment
  pathIndices.push(currentIndex);
  return {validPoints, pathIndices};
}

/**
 * Rebuild geometry with filtered trajectory points
 */
export function rebuildGeometry(
  originalGeometry: any,
  validPoints: TrajectoryPoint[],
  pathIndices: number[]
): ProcessedGeometry {
  const {positions, numericProps, properties} = originalGeometry;
  const newN = validPoints.length;

  if (newN === 0) {
    throw new Error('No valid trajectory points after filtering');
  }

  const newPositions = new Float64Array(newN * positions.size);
  const newProperties: BinaryLineFeature['properties'] = [];
  const newTimestamps = {value: new Float32Array(newN), size: 1};

  for (let i = 0; i < newN; i++) {
    const point = validPoints[i];

    // Copy point data to arrays
    newPositions.set(point.position, positions.size * i);
    newTimestamps.value[i] = point.timestamp;
  }

  const size = 2;
  const newNumericProps: NumericProps = {};
  const numericPropKeys = Object.keys(numericProps);
  for (const prop of numericPropKeys) {
    const propSize = numericProps[prop].size || 1;
    newNumericProps[prop] = {value: new Float32Array(newN), size: propSize};
  }

  // Properties are per-line.
  const newFeatureIds = new Uint16Array(newN);
  let dst = 0;
  for (let i = 0; i < pathIndices.length - 1; i++) {
    const startIndex = pathIndices[i];
    const endIndex = pathIndices[i + 1];
    const point = validPoints[startIndex];
    const srcIndex = point.index;
    const numVertices = endIndex - startIndex;

    const trajectoryId = point.trajectoryId;
    newProperties[i] = {trajectoryId, ...properties[srcIndex]};

    for (let j = startIndex; j < endIndex; j++) {
      newFeatureIds[j] = i; // Each vertex is marked with featureId of the line
    }

    for (const prop of numericPropKeys) {
      const {value: originalValue} = originalGeometry.numericProps[prop];
      const {value, size: propSize} = newNumericProps[prop];
      const dataSlice = originalValue.subarray(
        srcIndex * propSize,
        (srcIndex + numVertices) * propSize
      );
      value.set(dataSlice, dst * propSize);
    }
    dst += numVertices;
  }

  return {
    positions: {value: newPositions, size},
    properties: newProperties,
    numericProps: newNumericProps,
    featureIds: {value: newFeatureIds, size: 1},
    globalFeatureIds: {value: newFeatureIds, size: 1},
    pathIndices: {value: new Uint16Array(pathIndices), size: 1},
    type: 'LineString',
    attributes: {
      // getColor: {value: new Uint8Array(4 * newN), size: 4, normalized: true},
      getTimestamps: newTimestamps
    }
  };
}

/**
 * Main function to transform trajectory data with tile boundary awareness
 */
export function transformTrajectoryData(
  geometry: any,
  trajectoryIdColumn: string,
  timestampColumn: string,
  tileBounds: TileBounds,
  timestampRange?: {min: number | string; max: number | string}
): ProcessedGeometry | null {
  if (!geometry || !geometry.positions || (!geometry.numericProps && !geometry.properties)) {
    throw new Error('Invalid geometry: missing required properties');
  }

  const n = geometry.featureIds?.value?.length || 0;
  if (n === 0) {
    throw new Error('No features in geometry');
  }

  // Step 1: Extract trajectory and timestamp data
  const {tripIds, timestamps} = extractTrajectoryData(
    geometry,
    trajectoryIdColumn,
    timestampColumn,
    timestampRange
  );

  if (!tripIds.value.length || !timestamps.value.length) {
    throw new Error('No trajectory or timestamp data found');
  }

  // Check timestamp precision if no timestampRange provided (auto-normalization needed)
  if (!timestampRange) {
    throw new Error('Invalid geometry: missing timestampRange');
  }

  // Step 2: Group and sort trajectory points
  const trajectoryGroups = groupAndSortTrajectoryPoints(geometry, tripIds, timestamps);

  // Step 3: Create trajectory segments with tile boundary awareness
  const {validPoints, pathIndices} = createTrajectorySegments(trajectoryGroups, tileBounds);

  if (validPoints.length === 0) {
    return null;
  }

  // Step 4: Rebuild geometry with filtered points
  const processedGeometry = rebuildGeometry(geometry, validPoints, pathIndices);

  return processedGeometry;
}
