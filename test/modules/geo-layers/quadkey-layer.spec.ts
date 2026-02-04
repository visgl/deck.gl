// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {QuadkeyLayer} from '@deck.gl/geo-layers';
import {
  quadkeyToWorldBounds,
  getQuadkeyPolygon
} from '@deck.gl/geo-layers/quadkey-layer/quadkey-utils';

const TEST_DATA = [
  {
    quadkey: '0',
    coverage: 0.99,
    expectedBounds: [
      [0, 512],
      [253.44, 258.56]
    ]
  },
  {
    quadkey: '0123',
    coverage: 0.99,
    expectedBounds: [
      [160, 416],
      [191.68, 384.32]
    ]
  },
  {
    quadkey: '333',
    coverage: 0.99,
    expectedBounds: [
      [448, 64],
      [511.36, 0.6399999999999864]
    ]
  },
  {
    quadkey: '0',
    coverage: 1,
    expectedBounds: [
      [0, 512],
      [256, 256]
    ]
  },
  {
    quadkey: '0123',
    coverage: 1,
    expectedBounds: [
      [160, 416],
      [192, 384]
    ]
  },
  {
    quadkey: '333',
    coverage: 1,
    expectedBounds: [
      [448, 64],
      [512, 0]
    ]
  }
];

test('QuadkeyLayer', () => {
  const testCases = generateLayerTests({
    Layer: QuadkeyLayer,
    sampleProps: {
      data: TEST_DATA,
      getQuadkey: d => d.quadkey
    },
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
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

  testLayer({
    createSpy: (obj, method) => vi.spyOn(obj, method),
    Layer: QuadkeyLayer,
    testCases,
    onError: err => expect(err).toBeFalsy()
  });
});

test('QuadkeyLayer#quadkeyToWorldBounds', () => {
  for (const {quadkey, coverage, expectedBounds} of TEST_DATA) {
    const bounds = quadkeyToWorldBounds(quadkey, coverage);
    expect(bounds, 'Quadkey bounds calculated').toEqual(expectedBounds);
  }
});

test('QuadkeyLayer#getQuadkeyPolygon', () => {
  for (const {quadkey} of TEST_DATA) {
    const polygon = getQuadkeyPolygon(quadkey);
    expect(polygon instanceof Array, 'polygon is flat array').toBeTruthy();
    expect(polygon.length / 2 - 1, 'polygon has 4 sides').toBe(4);
    expect(polygon.slice(0, 2), 'polygon is closed').toEqual(polygon.slice(-2));
  }
});
