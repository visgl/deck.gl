// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {
  extractTrajectoryData,
  groupAndSortTrajectoryPoints,
  createTrajectorySegments,
  rebuildGeometry,
  applyTrajectoryColors,
  transformTrajectoryData,
  type TileBounds,
  type TrajectoryPoint
} from '@deck.gl/carto/layers/trajectory-utils';

// Helper function to create mock geometry
function createMockGeometry(
  trajectoryIds: string[],
  timestamps: number[],
  positions: number[]
): any {
  return {
    featureIds: {
      value: new Array(trajectoryIds.length).fill(0).map((_, i) => i),
      size: 1
    },
    positions: {
      value: new Float32Array(positions),
      size: 2
    },
    properties: trajectoryIds.map((id, i) => ({
      trip_id: id,
      timestamp: new Date(timestamps[i] * 1000).toISOString()
    })),
    numericProps: {}
  };
}

// Helper function to create mock geometry with numericProps
function createMockGeometryNumeric(
  trajectoryIds: string[],
  timestamps: number[],
  positions: number[]
): any {
  return {
    featureIds: {
      value: new Array(trajectoryIds.length).fill(0).map((_, i) => i),
      size: 1
    },
    positions: {
      value: new Float32Array(positions),
      size: 2
    },
    numericProps: {
      trip_id: {value: trajectoryIds, size: 1},
      timestamp: {value: timestamps, size: 1}
    },
    properties: undefined
  };
}

test('extractTrajectoryData - properties format', t => {
  const geometry = createMockGeometry(
    ['trip1', 'trip1', 'trip2'],
    [1000, 2000, 1500],
    [0, 0, 1, 1, 2, 2]
  );

  const result = extractTrajectoryData(geometry, 'trip_id', 'timestamp');

  t.ok(result.tripIds, 'returns tripIds');
  t.ok(result.timestamps, 'returns timestamps');
  t.deepEqual(result.tripIds.value, ['trip1', 'trip1', 'trip2'], 'extracts correct trip IDs');
  t.deepEqual(result.timestamps.value, [1000, 2000, 1500], 'converts timestamps correctly');
  t.end();
});

test('extractTrajectoryData - numericProps format', t => {
  const geometry = createMockGeometryNumeric(
    ['trip1', 'trip1', 'trip2'],
    [1000, 2000, 1500],
    [0, 0, 1, 1, 2, 2]
  );

  const result = extractTrajectoryData(geometry, 'trip_id', 'timestamp');

  t.deepEqual(result.tripIds.value, ['trip1', 'trip1', 'trip2'], 'extracts correct trip IDs');
  t.deepEqual(result.timestamps.value, [1000, 2000, 1500], 'extracts correct timestamps');
  t.end();
});

test('extractTrajectoryData - timestamp normalization', t => {
  // Test with Unix timestamps that would need normalization
  const baseTimestamp = 1640995200; // 2022-01-01 00:00:00 UTC
  const timestamps = [baseTimestamp, baseTimestamp + 3600, baseTimestamp + 1800];
  const geometry = createMockGeometry(['trip1', 'trip1', 'trip2'], timestamps, [0, 0, 1, 1, 2, 2]);

  const timestampRange = {
    min: baseTimestamp,
    max: baseTimestamp + 3600
  };

  const result = extractTrajectoryData(geometry, 'trip_id', 'timestamp', timestampRange);

  t.deepEqual(result.timestamps.value, [0, 3600, 1800], 'normalizes timestamps relative to min');
  t.end();
});

test('extractTrajectoryData - ISO string normalization', t => {
  const geometry = createMockGeometry(
    ['trip1', 'trip1'],
    ['2022-01-01T00:00:00Z', '2022-01-01T01:00:00Z'],
    [0, 0, 1, 1]
  );

  const timestampRange = {
    min: '2022-01-01T00:00:00Z',
    max: '2022-01-01T01:00:00Z'
  };

  const result = extractTrajectoryData(geometry, 'trip_id', 'timestamp', timestampRange);

  t.equal(result.timestamps.value[0], 0, 'first timestamp normalized to 0');
  t.equal(result.timestamps.value[1], 3600, 'second timestamp normalized to 3600 (1 hour)');
  t.end();
});

test('groupAndSortTrajectoryPoints', t => {
  const geometry = createMockGeometry(
    ['trip1', 'trip2', 'trip1'],
    [2000, 1500, 1000],
    [0, 0, 1, 1, 2, 2]
  );
  const {tripIds, timestamps} = extractTrajectoryData(geometry, 'trip_id', 'timestamp');

  const groups = groupAndSortTrajectoryPoints(geometry, tripIds, timestamps);

  t.equal(groups.size, 2, 'creates correct number of groups');
  t.ok(groups.has('trip1'), 'has trip1 group');
  t.ok(groups.has('trip2'), 'has trip2 group');

  const trip1Points = groups.get('trip1') as TrajectoryPoint[];
  t.equal(trip1Points.length, 2, 'trip1 has correct number of points');
  t.equal(trip1Points[0].timestamp, 1000, 'trip1 points sorted by timestamp - first');
  t.equal(trip1Points[1].timestamp, 2000, 'trip1 points sorted by timestamp - second');

  t.end();
});

test('createTrajectorySegments - no tile bounds', t => {
  const mockPoints: TrajectoryPoint[] = [
    {index: 0, timestamp: 1000, lon: 0, lat: 0, position: [0, 0], trajectoryId: 'trip1'},
    {index: 1, timestamp: 2000, lon: 1, lat: 1, position: [1, 1], trajectoryId: 'trip1'},
    {index: 2, timestamp: 1500, lon: 2, lat: 2, position: [2, 2], trajectoryId: 'trip2'}
  ];
  const groups = new Map([
    ['trip1', mockPoints.slice(0, 2)],
    ['trip2', mockPoints.slice(2)]
  ]);

  const result = createTrajectorySegments(groups);

  t.equal(result.validPoints.length, 3, 'includes all points when no bounds');
  t.equal(result.pathIndices.length, 2, 'creates path indices for each trajectory');
  t.deepEqual(result.pathIndices, [0, 2], 'correct path indices');
  t.end();
});

test('createTrajectorySegments - with tile bounds', t => {
  const mockPoints: TrajectoryPoint[] = [
    {index: 0, timestamp: 1000, lon: 0, lat: 0, position: [0, 0], trajectoryId: 'trip1'},
    {index: 1, timestamp: 2000, lon: 5, lat: 5, position: [5, 5], trajectoryId: 'trip1'}, // outside bounds
    {index: 2, timestamp: 1500, lon: 1, lat: 1, position: [1, 1], trajectoryId: 'trip2'}
  ];
  const groups = new Map([
    ['trip1', mockPoints.slice(0, 2)],
    ['trip2', mockPoints.slice(2)]
  ]);

  const tileBounds: TileBounds = {west: -1, south: -1, east: 2, north: 2};
  const result = createTrajectorySegments(groups, tileBounds);

  t.equal(result.validPoints.length, 2, 'filters out points outside bounds');
  t.equal(result.validPoints[0].lon, 0, 'keeps first point in bounds');
  t.equal(result.validPoints[1].lon, 1, 'keeps second point in bounds');
  t.end();
});

test('rebuildGeometry', t => {
  const originalGeometry = createMockGeometry(['trip1', 'trip1'], [1000, 2000], [0, 0, 1, 1]);
  const validPoints: TrajectoryPoint[] = [
    {index: 0, timestamp: 1000, lon: 0, lat: 0, position: [0, 0], trajectoryId: 'trip1'},
    {index: 1, timestamp: 2000, lon: 1, lat: 1, position: [1, 1], trajectoryId: 'trip1'}
  ];
  const pathIndices = [0];
  const tripIds = {value: ['trip1', 'trip1']};

  const result = rebuildGeometry(originalGeometry, validPoints, pathIndices, tripIds, false);

  t.equal(result.type, 'LineString', 'sets correct geometry type');
  t.equal(result.positions.value.length, 4, 'creates correct positions array');
  t.equal(result.positions.size, 2, 'sets correct position size');
  t.equal(result.pathIndices.value.length, 2, 'creates path indices with end marker');
  t.deepEqual(Array.from(result.pathIndices.value), [0, 2], 'correct path indices values');
  t.ok(result.attributes.getColor, 'creates color attribute');
  t.ok(result.attributes.getTimestamps, 'creates timestamps attribute');
  t.ok(result.globalFeatureIds, 'creates globalFeatureIds');
  t.equal(result.globalFeatureIds.value.length, 2, 'globalFeatureIds has correct length');
  t.end();
});

test('rebuildGeometry - with altitude', t => {
  const originalGeometry = {
    ...createMockGeometry(['trip1', 'trip1'], [1000, 2000], [0, 0, 100, 1, 1, 200]),
    positions: {
      value: new Float32Array([0, 0, 100, 1, 1, 200]),
      size: 3
    }
  };
  const validPoints: TrajectoryPoint[] = [
    {index: 0, timestamp: 1000, lon: 0, lat: 0, position: [0, 0], trajectoryId: 'trip1'},
    {index: 1, timestamp: 2000, lon: 1, lat: 1, position: [1, 1], trajectoryId: 'trip1'}
  ];
  const pathIndices = [0];
  const tripIds = {value: ['trip1', 'trip1']};

  const result = rebuildGeometry(originalGeometry, validPoints, pathIndices, tripIds, true);

  t.equal(result.positions.size, 3, 'sets correct position size for 3D');
  t.equal(result.positions.value.length, 6, 'creates correct 3D positions array');
  t.end();
});

test('rebuildGeometry - with existing globalFeatureIds', t => {
  const originalGeometry = {
    ...createMockGeometry(['trip1', 'trip1'], [1000, 2000], [0, 0, 1, 1]),
    globalFeatureIds: {
      value: [100, 101],
      size: 1
    }
  };
  const validPoints: TrajectoryPoint[] = [
    {index: 0, timestamp: 1000, lon: 0, lat: 0, position: [0, 0], trajectoryId: 'trip1'},
    {index: 1, timestamp: 2000, lon: 1, lat: 1, position: [1, 1], trajectoryId: 'trip1'}
  ];
  const pathIndices = [0];
  const tripIds = {value: ['trip1', 'trip1']};

  const result = rebuildGeometry(originalGeometry, validPoints, pathIndices, tripIds, false);

  t.deepEqual(result.globalFeatureIds.value, [100, 101], 'preserves original globalFeatureIds');
  t.end();
});

test('applyTrajectoryColors', t => {
  const mockGeometry = {
    positions: {value: new Float64Array([0, 0, 1, 1, 2, 2]), size: 2},
    attributes: {
      getColor: {value: new Uint8Array(12), size: 4, normalized: true},
      getTimestamps: {value: new Float32Array([1000, 2000, 3000]), size: 1}
    }
  };

  const result = applyTrajectoryColors(mockGeometry, 'Sunset');

  t.ok(result.attributes.getColor, 'preserves color attribute');
  t.notEqual(result.attributes.getColor.value[0], 0, 'applies colors to first point');
  t.notEqual(result.attributes.getColor.value[4], 0, 'applies colors to second point');
  t.end();
});

test('transformTrajectoryData - complete workflow', t => {
  const geometry = createMockGeometry(
    ['trip1', 'trip1', 'trip2'],
    [2000, 1000, 1500],
    [0, 0, 1, 1, 2, 2]
  );

  const result = transformTrajectoryData(geometry, 'Sunset', false, 'trip_id', 'timestamp');

  t.ok(result, 'returns result');
  t.equal(result.type, 'LineString', 'correct geometry type');
  t.ok(result.positions, 'has positions');
  t.ok(result.pathIndices, 'has path indices');
  t.ok(result.attributes.getColor, 'has color attributes');
  t.ok(result.attributes.getTimestamps, 'has timestamp attributes');

  // Check that points are sorted by timestamp within trajectories
  const trip1Timestamps = [
    result.attributes.getTimestamps.value[0],
    result.attributes.getTimestamps.value[1]
  ];
  t.ok(trip1Timestamps[0] <= trip1Timestamps[1], 'timestamps are sorted within trajectory');

  t.end();
});

test('transformTrajectoryData - with tile bounds', t => {
  const geometry = createMockGeometry(
    ['trip1', 'trip1', 'trip1'],
    [1000, 2000, 3000],
    [0, 0, 5, 5, 1, 1] // middle point outside bounds
  );

  const tileBounds: TileBounds = {west: -1, south: -1, east: 2, north: 2};

  const result = transformTrajectoryData(
    geometry,
    'Sunset',
    false,
    'trip_id',
    'timestamp',
    tileBounds
  );

  // Should filter out the middle point that's outside bounds
  t.equal(result.positions.value.length, 4, 'filters out points outside tile bounds');
  t.end();
});

test('transformTrajectoryData - error handling', t => {
  t.throws(
    () => transformTrajectoryData(null, 'Sunset', false, 'trip_id', 'timestamp'),
    /Invalid geometry/,
    'throws error for null geometry'
  );

  t.throws(
    () => transformTrajectoryData({}, 'Sunset', false, 'trip_id', 'timestamp'),
    /Invalid geometry/,
    'throws error for empty geometry'
  );

  const emptyGeometry = {
    featureIds: {value: [], size: 1},
    positions: {value: new Float32Array([]), size: 2},
    properties: [],
    numericProps: {}
  };

  t.throws(
    () => transformTrajectoryData(emptyGeometry, 'Sunset', false, 'trip_id', 'timestamp'),
    /No features/,
    'throws error for empty features'
  );

  t.end();
});
