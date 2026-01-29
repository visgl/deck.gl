// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {createPointsFromLines, createPointsFromPolygons} from '@deck.gl/carto/layers/label-utils';
import type {BinaryFeatureCollection} from '@loaders.gl/schema';

test('createPointsFromLines', () => {
  const lines: BinaryFeatureCollection['lines'] = {
    type: 'LineString',
    positions: {
      value: new Float32Array([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5]),
      size: 2
    },
    pathIndices: {
      value: new Uint32Array([0, 3, 6]),
      size: 1
    },
    featureIds: {
      value: new Uint32Array([0, 0, 0, 1, 1, 1]),
      size: 1
    },
    globalFeatureIds: {
      value: new Uint32Array([100, 100, 100, 101, 101, 101]),
      size: 1
    },
    numericProps: {
      custom_id: {
        value: new Float32Array([1, 1, 1, 2, 2, 2]),
        size: 1
      }
    },
    properties: [{name: 'line1'}, {name: 'line2'}],
    fields: []
  };

  const points = createPointsFromLines(lines, 'custom_id');

  expect(points, 'returns points object').toBeTruthy();
  if (!points) {
    throw new Error('points should not be null');
    return;
  }

  expect(points.type, 'correct type').toBe('Point');
  expect(Array.from(points.positions.value), 'correct midpoint positions').toEqual([1, 1, 4, 4]);
  expect(points.positions.size, 'correct position size').toBe(2);
  expect(Array.from(points.featureIds.value), 'correct feature ids').toEqual([0, 1]);
  expect(Array.from(points.globalFeatureIds.value), 'correct global feature ids').toEqual([
    100, 101
  ]);
  expect(points.properties, 'correct properties').toEqual([{name: 'line1'}, {name: 'line2'}]);
  expect(Array.from(points.numericProps.custom_id.value), 'correct numeric properties').toEqual([
    1, 2
  ]);

  // Test with missing uniqueIdProperty
  const invalidLines: BinaryFeatureCollection['lines'] = {
    type: 'LineString',
    positions: {
      value: new Float32Array([0, 0, 1, 1]),
      size: 2
    },
    pathIndices: {
      value: new Uint32Array([0, 2]),
      size: 1
    },
    featureIds: {
      value: new Uint32Array([0, 0]),
      size: 1
    },
    globalFeatureIds: {
      value: new Uint32Array([0, 0]),
      size: 1
    },
    numericProps: {},
    properties: [{}, {}],
    fields: []
  };
  const invalidResult = createPointsFromLines(invalidLines, 'custom_id');
  expect(invalidResult, 'returns points object for invalid input').toBeTruthy();
  expect(
    Array.from(invalidResult!.positions.value),
    'correct midpoint position when falling back to index'
  ).toEqual([0.5, 0.5]);
  expect(invalidResult!.properties, 'correct empty properties').toEqual([{}]);

  // Test with non-existent uniqueIdProperty
  const noIdResult = createPointsFromLines(lines, 'non_existent_id');
  expect(noIdResult, 'returns points object when uniqueIdProperty does not exist').toBeTruthy();
  expect(
    Array.from(noIdResult!.positions.value),
    'correct midpoint position for single line when with non-existent uniqueIdProperty'
  ).toEqual([1, 1]);
  expect(noIdResult!.properties, 'correct properties').toEqual([{name: 'line1'}]);
});

test('createPointsFromLines - line midpoint calculation', () => {
  // Test two-point line
  const twoPointLine: BinaryFeatureCollection['lines'] = {
    type: 'LineString',
    positions: {
      value: new Float32Array([0, 0, 2, 2]),
      size: 2
    },
    pathIndices: {
      value: new Uint32Array([0, 2]),
      size: 1
    },
    featureIds: {value: new Uint32Array([0, 0]), size: 1},
    globalFeatureIds: {value: new Uint32Array([0, 0]), size: 1},
    numericProps: {
      id: {value: new Float32Array([1, 1]), size: 1}
    },
    properties: [],
    fields: []
  };

  const twoPointResult = createPointsFromLines(twoPointLine, 'id');
  expect(
    Array.from(twoPointResult!.positions.value),
    'correct midpoint for two-point line'
  ).toEqual([1, 1]);

  // Test multi-point line
  const multiPointLine: BinaryFeatureCollection['lines'] = {
    type: 'LineString',
    positions: {
      value: new Float32Array([0, 0, 1, 1, 2, 2, 3, 3]),
      size: 2
    },
    pathIndices: {
      value: new Uint32Array([0, 4]),
      size: 1
    },
    featureIds: {value: new Uint32Array([0, 0, 0, 0]), size: 1},
    globalFeatureIds: {value: new Uint32Array([0, 0, 0, 0]), size: 1},
    numericProps: {
      id: {value: new Float32Array([1, 1, 1, 1]), size: 1}
    },
    properties: [],
    fields: []
  };

  const multiPointResult = createPointsFromLines(multiPointLine, 'id');
  expect(
    Array.from(multiPointResult!.positions.value),
    'correct midpoint for multi-point line'
  ).toEqual([2, 2]);
});

test('createPointsFromPolygons', () => {
  const polygons: Required<Required<BinaryFeatureCollection>['polygons']> = {
    type: 'Polygon',
    positions: {
      value: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1, 0, 0]),
      size: 2
    },
    polygonIndices: {
      value: new Uint32Array([0, 5]),
      size: 1
    },
    primitivePolygonIndices: {
      value: new Uint32Array([5]),
      size: 1
    },
    triangles: {
      value: new Uint32Array([0, 1, 2, 0, 2, 3]),
      size: 1
    },
    featureIds: {
      value: new Uint32Array([0, 0, 0, 0, 0]),
      size: 1
    },
    globalFeatureIds: {
      value: new Uint32Array([100, 100, 100, 100, 100]),
      size: 1
    },
    numericProps: {
      area: {
        value: new Float32Array([1, 1, 1, 1, 1]),
        size: 1
      }
    },
    properties: [{name: 'polygon1'}],
    fields: []
  };

  const tileBbox = {
    west: -1,
    south: -1,
    east: 2,
    north: 2
  };

  const points = createPointsFromPolygons(polygons, tileBbox, {extruded: false});

  expect(points, 'returns points object').toBeTruthy();
  if (!points) {
    throw new Error('points should not be null');
    return;
  }

  expect(points.type, 'correct type').toBe('Point');
  expect(Array.from(points.positions.value), 'correct centroid position').toEqual([0.5, 0.5]);
  expect(points.positions.size, 'correct position size').toBe(2);
  expect(Array.from(points.featureIds.value), 'correct feature ids').toEqual([0]);
  expect(Array.from(points.globalFeatureIds.value), 'correct global feature ids').toEqual([100]);
  expect(points.properties, 'correct properties').toEqual([{name: 'polygon1'}]);
  expect(Array.from(points.numericProps.area.value), 'correct numeric properties').toEqual([1]);

  // Test with polygon outside tile bounds
  const outOfBoundsPolygons: Required<Required<BinaryFeatureCollection>['polygons']> = {
    type: 'Polygon',
    positions: {
      value: new Float32Array([10, 10, 11, 10, 11, 11, 10, 11, 10, 10]),
      size: 2
    },
    polygonIndices: {
      value: new Uint32Array([0, 5]),
      size: 1
    },
    primitivePolygonIndices: {
      value: new Uint32Array([5]),
      size: 1
    },
    triangles: {
      value: new Uint32Array([0, 1, 2, 0, 2, 3]),
      size: 1
    },
    featureIds: {
      value: new Uint32Array([0, 0, 0, 0, 0]),
      size: 1
    },
    globalFeatureIds: {
      value: new Uint32Array([100, 100, 100, 100, 100]),
      size: 1
    },
    numericProps: {
      area: {
        value: new Float32Array([1]),
        size: 1
      }
    },
    properties: [{name: 'polygon1'}],
    fields: []
  };

  const outOfBoundsPoints = createPointsFromPolygons(outOfBoundsPolygons, tileBbox, {
    extruded: false
  });
  expect(outOfBoundsPoints, 'returns points object for out of bounds polygon').toBeTruthy();
  if (outOfBoundsPoints) {
    expect(outOfBoundsPoints.positions.value.length, 'no points for out of bounds polygon').toBe(0);
  }

  // Test with tiny polygon (below area threshold)
  const tinyPolygons: Required<Required<BinaryFeatureCollection>['polygons']> = {
    type: 'Polygon',
    positions: {
      value: new Float32Array([0, 0, 0.001, 0, 0.001, 0.001, 0, 0.001, 0, 0]),
      size: 2
    },
    polygonIndices: {
      value: new Uint32Array([0, 5]),
      size: 1
    },
    primitivePolygonIndices: {
      value: new Uint32Array([5]),
      size: 1
    },
    triangles: {
      value: new Uint32Array([0, 1, 2, 0, 2, 3]),
      size: 1
    },
    featureIds: {
      value: new Uint32Array([0, 0, 0, 0, 0]),
      size: 1
    },
    globalFeatureIds: {
      value: new Uint32Array([100, 100, 100, 100, 100]),
      size: 1
    },
    numericProps: {
      area: {
        value: new Float32Array([1]),
        size: 1
      }
    },
    properties: [{name: 'polygon1'}],
    fields: []
  };

  const tinyPoints = createPointsFromPolygons(tinyPolygons, tileBbox, {extruded: false});
  expect(tinyPoints, 'returns points object for tiny polygon').toBeTruthy();
  if (tinyPoints) {
    expect(tinyPoints.positions.value.length, 'no points for tiny polygon').toBe(0);
  }
});

test('createPointsFromPolygons - area and centroid calculation', () => {
  // Test square polygon
  const square: Required<Required<BinaryFeatureCollection>['polygons']> = {
    type: 'Polygon',
    positions: {
      value: new Float32Array([0, 0, 2, 0, 2, 2, 0, 2, 0, 0]),
      size: 2
    },
    polygonIndices: {
      value: new Uint32Array([0, 5]),
      size: 1
    },
    primitivePolygonIndices: {
      value: new Uint32Array([5]),
      size: 1
    },
    triangles: {
      value: new Uint32Array([0, 1, 2, 0, 2, 3]),
      size: 1
    },
    featureIds: {value: new Uint32Array([0, 0, 0, 0, 0]), size: 1},
    globalFeatureIds: {value: new Uint32Array([0, 0, 0, 0, 0]), size: 1},
    numericProps: {},
    properties: [],
    fields: []
  };

  const tileBbox = {west: -1, south: -1, east: 3, north: 3};
  const result = createPointsFromPolygons(square, tileBbox, {extruded: false});

  expect(Array.from(result.positions.value), 'correct centroid for square').toEqual([1, 1]);

  // Test tiny polygon (should be filtered out due to area threshold)
  const tiny: Required<Required<BinaryFeatureCollection>['polygons']> = {
    ...square,
    positions: {
      value: new Float32Array([0, 0, 0.001, 0, 0.001, 0.001, 0, 0.001, 0, 0]),
      size: 2
    }
  };

  const tinyResult = createPointsFromPolygons(tiny, tileBbox, {extruded: false});
  expect(tinyResult.positions.value.length, 'tiny polygon filtered by area threshold').toBe(0);
});

test('createPointsFromLines - property as unique ID', () => {
  const lines: BinaryFeatureCollection['lines'] = {
    type: 'LineString',
    positions: {
      value: new Float32Array([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5]),
      size: 2
    },
    pathIndices: {
      value: new Uint32Array([0, 3, 6]),
      size: 1
    },
    featureIds: {
      value: new Uint32Array([0, 0, 0, 1, 1, 1]),
      size: 1
    },
    globalFeatureIds: {
      value: new Uint32Array([100, 100, 100, 101, 101, 101]),
      size: 1
    },
    numericProps: {},
    properties: [
      {name: 'line1', group: 'A'},
      {name: 'line2', group: 'A'}
    ],
    fields: []
  };

  const points = createPointsFromLines(lines, 'group');

  expect(points, 'returns points object').toBeTruthy();
  if (!points) {
    throw new Error('points should not be null');
    return;
  }

  expect(points.type, 'correct type').toBe('Point');
  expect(Array.from(points.positions.value), 'correct midpoint position').toEqual([1, 1]);
  expect(points.positions.size, 'correct position size').toBe(2);
  expect(Array.from(points.featureIds.value), 'correct feature ids').toEqual([0]);
  expect(Array.from(points.globalFeatureIds.value), 'correct global feature ids').toEqual([100]);
  expect(points.properties, 'correct properties').toEqual([{name: 'line1', group: 'A'}]);

  // Test with non-existent property
  const noPropertyResult = createPointsFromLines(lines, 'non_existent_property');
  expect(noPropertyResult, 'returns points object when property does not exist').toBeTruthy();
  expect(
    Array.from(noPropertyResult!.positions.value),
    'correct midpoint position when falling back to index'
  ).toEqual([1, 1]);
});

test('createPointsFromLines - fallback when uniqueIdProperty not found', () => {
  const lines: BinaryFeatureCollection['lines'] = {
    type: 'LineString',
    positions: {
      value: new Float32Array([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5]),
      size: 2
    },
    pathIndices: {
      value: new Uint32Array([0, 3, 6]),
      size: 1
    },
    featureIds: {
      value: new Uint32Array([0, 0, 0, 1, 1, 1]),
      size: 1
    },
    globalFeatureIds: {
      value: new Uint32Array([100, 100, 100, 101, 101, 101]),
      size: 1
    },
    numericProps: {},
    properties: [{}, {}],
    fields: []
  };

  const points = createPointsFromLines(lines, 'non_existent_property');

  expect(points, 'returns points object').toBeTruthy();
  if (!points) {
    throw new Error('points should not be null');
    return;
  }

  expect(points.type, 'correct type').toBe('Point');
  expect(Array.from(points.positions.value), 'correct midpoint position').toEqual([1, 1]);
  expect(points.positions.size, 'correct position size').toBe(2);
  expect(Array.from(points.featureIds.value), 'correct feature ids').toEqual([0]);
  expect(Array.from(points.globalFeatureIds.value), 'correct global feature ids').toEqual([100]);
  expect(points.properties, 'correct empty properties').toEqual([{}]);
});

test('createPointsFromLines - mixed uniqueIdProperty', () => {
  const lines: BinaryFeatureCollection['lines'] = {
    type: 'LineString',
    positions: {
      value: new Float32Array([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8]),
      size: 2
    },
    pathIndices: {
      value: new Uint32Array([0, 3, 6, 9]),
      size: 1
    },
    featureIds: {
      value: new Uint32Array([0, 0, 0, 1, 1, 1, 2, 2, 2]),
      size: 1
    },
    globalFeatureIds: {
      value: new Uint32Array([100, 100, 100, 101, 101, 101, 102, 102, 102]),
      size: 1
    },
    numericProps: {},
    properties: [{name: 'line1', group: 'A'}, {name: 'line2', group: 'A'}, {name: 'line3'}],
    fields: []
  };

  const points = createPointsFromLines(lines, 'group');

  expect(points, 'returns points object').toBeTruthy();
  if (!points) {
    throw new Error('points should not be null');
    return;
  }

  expect(points.type, 'correct type').toBe('Point');
  expect(Array.from(points.positions.value), 'correct midpoint positions').toEqual([1, 1, 7, 7]);
  expect(points.positions.size, 'correct position size').toBe(2);
  expect(Array.from(points.featureIds.value), 'correct feature ids').toEqual([0, 1]);
  expect(Array.from(points.globalFeatureIds.value), 'correct global feature ids').toEqual([
    100, 102
  ]);
  expect(points.properties, 'correct properties').toEqual([
    {name: 'line1', group: 'A'},
    {name: 'line3'}
  ]);
});
