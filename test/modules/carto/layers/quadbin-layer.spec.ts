// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import QuadbinLayer from '@deck.gl/carto/layers/quadbin-layer';
import {
  quadbinToOffset,
  quadbinToWorldBounds,
  getQuadbinPolygon
} from '@deck.gl/carto/layers/quadbin-utils';

const TEST_DATA = [
  {
    quadbin: 5193776270265024511n, // quadkey '0'
    coverage: 1,
    expectedBounds: [
      [0, 512],
      [256, 256]
    ],
    expectedOffset: [0, 512, 256]
  },
  {
    quadbin: 5193776270265024511n, // quadkey '0'
    coverage: 0.99,
    expectedBounds: [
      [0, 512],
      [253.44, 258.56]
    ],
    expectedOffset: [0, 512, 256]
  },
  {
    quadbin: 5206653750449537023n, // quadkey 0123
    coverage: 0.99,
    expectedBounds: [
      [160, 416],
      [191.68, 384.32]
    ],
    expectedOffset: [160, 416, 32]
  },
  {
    quadbin: 5206161169240293375n, // quadkey 333
    coverage: 0.99,
    expectedBounds: [
      [448, 64],
      [511.36, 0.6400000000000006]
    ],
    expectedOffset: [448, 64, 64]
  }
];

test('QuadbinLayer', () => {
  const testCases = generateLayerTests({
    Layer: QuadbinLayer,
    sampleProps: {
      data: TEST_DATA,
      getQuadbin: d => d.quadbin
    },
    assert: (cond, msg) => expect(cond).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer, subLayer}) => {
      expect(subLayer, 'subLayers rendered').toBeTruthy();

      if (layer.props.data.length) {
        expect(subLayer.state.paths.length, 'should update PolygonLayers state.paths').toBe(
          TEST_DATA.length
        );
      }
    }
  });

  testLayer({Layer: QuadbinLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('QuadbinLayer#quadbinToOffset', () => {
  for (const {quadbin, expectedOffset} of TEST_DATA) {
    const offset = quadbinToOffset(quadbin);
    expect(offset, 'Quadbin offset calculated').toEqual(expectedOffset);
  }
});

test('QuadbinLayer#quadbinToWorldBounds', () => {
  for (const {quadbin, coverage, expectedBounds} of TEST_DATA) {
    const bounds = quadbinToWorldBounds(quadbin, coverage);
    expect(bounds, 'Quadbin bounds calculated').toEqual(expectedBounds);
  }
});

test('QuadbinLayer#getQuadbinPolygon', () => {
  for (const {quadbin} of TEST_DATA) {
    const polygon = getQuadbinPolygon(quadbin);
    expect(polygon instanceof Array, 'polygon is flat array').toBeTruthy();
    expect(polygon.length / 2 - 1, 'polygon has 4 sides').toBe(4);
    expect(polygon.slice(0, 2), 'polygon is closed').toEqual(polygon.slice(-2));
  }
});
