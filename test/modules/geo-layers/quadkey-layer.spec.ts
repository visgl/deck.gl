// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
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

test('QuadkeyLayer', t => {
  const testCases = generateLayerTests({
    Layer: QuadkeyLayer,
    sampleProps: {
      data: TEST_DATA,
      getQuadkey: d => d.quadkey
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({layer, subLayer}) => {
      t.ok(subLayer, 'subLayers rendered');

      if (layer.props.data.length) {
        t.equal(
          subLayer.state.paths.length,
          TEST_DATA.length,
          'should update PolygonLayers state.paths'
        );
      }
    }
  });

  testLayer({Layer: QuadkeyLayer, testCases, onError: t.notOk});

  t.end();
});

test('QuadkeyLayer#quadkeyToWorldBounds', t => {
  for (const {quadkey, coverage, expectedBounds} of TEST_DATA) {
    const bounds = quadkeyToWorldBounds(quadkey, coverage);
    t.deepEquals(bounds, expectedBounds, 'Quadkey bounds calculated');
  }

  t.end();
});

test('QuadkeyLayer#getQuadkeyPolygon', t => {
  for (const {quadkey} of TEST_DATA) {
    const polygon = getQuadkeyPolygon(quadkey);
    t.ok(polygon instanceof Array, 'polygon is flat array');
    t.is(polygon.length / 2 - 1, 4, 'polygon has 4 sides');
    t.deepEqual(polygon.slice(0, 2), polygon.slice(-2), 'polygon is closed');
  }

  t.end();
});
