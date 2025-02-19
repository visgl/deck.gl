// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {createPointsFromLines, createPointsFromPolygons} from '@deck.gl/carto/layers/label-utils';
import type {BinaryFeatureCollection} from '@loaders.gl/schema';

test('createPointsFromLines', t => {
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

  t.ok(points, 'returns points object');
  if (!points) {
    t.fail('points should not be null');
    return t.end();
  }

  t.equal(points.type, 'Point', 'correct type');
  t.deepEqual(Array.from(points.positions.value), [1, 1, 4, 4], 'correct midpoint positions');
  t.equal(points.positions.size, 2, 'correct position size');
  t.deepEqual(Array.from(points.featureIds.value), [0, 1], 'correct feature ids');
  t.deepEqual(Array.from(points.globalFeatureIds.value), [100, 101], 'correct global feature ids');
  t.deepEqual(points.properties, [{name: 'line1'}, {name: 'line2'}], 'correct properties');
  t.deepEqual(
    Array.from(points.numericProps.custom_id.value),
    [1, 2],
    'correct numeric properties'
  );

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
  t.ok(invalidResult, 'returns points object for invalid input');
  t.deepEqual(
    Array.from(invalidResult!.positions.value),
    [0.5, 0.5],
    'correct midpoint position when falling back to index'
  );
  t.deepEqual(invalidResult!.properties, [{}], 'correct empty properties');

  // Test with non-existent uniqueIdProperty
  const noIdResult = createPointsFromLines(lines, 'non_existent_id');
  t.ok(noIdResult, 'returns points object when uniqueIdProperty does not exist');
  t.deepEqual(
    Array.from(noIdResult!.positions.value),
    [1, 1],
    'correct midpoint position for single line when with non-existent uniqueIdProperty'
  );
  t.deepEqual(noIdResult!.properties, [{name: 'line1'}], 'correct properties');

  t.end();
});

test('createPointsFromLines - line midpoint calculation', t => {
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
  t.deepEqual(
    Array.from(twoPointResult!.positions.value),
    [1, 1],
    'correct midpoint for two-point line'
  );

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
  t.deepEqual(
    Array.from(multiPointResult!.positions.value),
    [2, 2],
    'correct midpoint for multi-point line'
  );

  t.end();
});

test('createPointsFromPolygons', t => {
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

  t.ok(points, 'returns points object');
  if (!points) {
    t.fail('points should not be null');
    return t.end();
  }

  t.equal(points.type, 'Point', 'correct type');
  t.deepEqual(Array.from(points.positions.value), [0.5, 0.5], 'correct centroid position');
  t.equal(points.positions.size, 2, 'correct position size');
  t.deepEqual(Array.from(points.featureIds.value), [0], 'correct feature ids');
  t.deepEqual(Array.from(points.globalFeatureIds.value), [100], 'correct global feature ids');
  t.deepEqual(points.properties, [{name: 'polygon1'}], 'correct properties');
  t.deepEqual(Array.from(points.numericProps.area.value), [1], 'correct numeric properties');

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
  t.ok(outOfBoundsPoints, 'returns points object for out of bounds polygon');
  if (outOfBoundsPoints) {
    t.equal(outOfBoundsPoints.positions.value.length, 0, 'no points for out of bounds polygon');
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
  t.ok(tinyPoints, 'returns points object for tiny polygon');
  if (tinyPoints) {
    t.equal(tinyPoints.positions.value.length, 0, 'no points for tiny polygon');
  }

  t.end();
});

test('createPointsFromPolygons - area and centroid calculation', t => {
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

  t.deepEqual(Array.from(result.positions.value), [1, 1], 'correct centroid for square');

  // Test tiny polygon (should be filtered out due to area threshold)
  const tiny: Required<Required<BinaryFeatureCollection>['polygons']> = {
    ...square,
    positions: {
      value: new Float32Array([0, 0, 0.001, 0, 0.001, 0.001, 0, 0.001, 0, 0]),
      size: 2
    }
  };

  const tinyResult = createPointsFromPolygons(tiny, tileBbox, {extruded: false});
  t.equal(tinyResult.positions.value.length, 0, 'tiny polygon filtered by area threshold');

  t.end();
});

test('createPointsFromLines - property as unique ID', t => {
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

  t.ok(points, 'returns points object');
  if (!points) {
    t.fail('points should not be null');
    return t.end();
  }

  t.equal(points.type, 'Point', 'correct type');
  t.deepEqual(Array.from(points.positions.value), [1, 1], 'correct midpoint position');
  t.equal(points.positions.size, 2, 'correct position size');
  t.deepEqual(Array.from(points.featureIds.value), [0], 'correct feature ids');
  t.deepEqual(Array.from(points.globalFeatureIds.value), [100], 'correct global feature ids');
  t.deepEqual(points.properties, [{name: 'line1', group: 'A'}], 'correct properties');

  // Test with non-existent property
  const noPropertyResult = createPointsFromLines(lines, 'non_existent_property');
  t.ok(noPropertyResult, 'returns points object when property does not exist');
  t.deepEqual(
    Array.from(noPropertyResult!.positions.value),
    [1, 1],
    'correct midpoint position when falling back to index'
  );

  t.end();
});

test('createPointsFromLines - fallback when uniqueIdProperty not found', t => {
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

  t.ok(points, 'returns points object');
  if (!points) {
    t.fail('points should not be null');
    return t.end();
  }

  t.equal(points.type, 'Point', 'correct type');
  t.deepEqual(Array.from(points.positions.value), [1, 1], 'correct midpoint position');
  t.equal(points.positions.size, 2, 'correct position size');
  t.deepEqual(Array.from(points.featureIds.value), [0], 'correct feature ids');
  t.deepEqual(Array.from(points.globalFeatureIds.value), [100], 'correct global feature ids');
  t.deepEqual(points.properties, [{}], 'correct empty properties');

  t.end();
});

test('createPointsFromLines - mixed uniqueIdProperty', t => {
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

  t.ok(points, 'returns points object');
  if (!points) {
    t.fail('points should not be null');
    return t.end();
  }

  t.equal(points.type, 'Point', 'correct type');
  t.deepEqual(Array.from(points.positions.value), [1, 1, 7, 7], 'correct midpoint positions');
  t.equal(points.positions.size, 2, 'correct position size');
  t.deepEqual(Array.from(points.featureIds.value), [0, 1], 'correct feature ids');
  t.deepEqual(Array.from(points.globalFeatureIds.value), [100, 102], 'correct global feature ids');
  t.deepEqual(
    points.properties,
    [{name: 'line1', group: 'A'}, {name: 'line3'}],
    'correct properties'
  );

  t.end();
});
