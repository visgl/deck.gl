// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {GeohashLayer} from '@deck.gl/geo-layers';
import {getGeohashPolygon, getGeohashBounds} from '@deck.gl/geo-layers/geohash-layer/geohash-utils';

const TEST_DATA = [
  {
    geohash: '9',
    expectedBounds: [0, -135, 45, -90]
  },
  {
    geohash: '9q8yybj',
    expectedBounds: [37.7490234375, -122.39181518554688, 37.750396728515625, -122.39044189453125]
  },
  {
    geohash: '9q8yy',
    expectedBounds: [37.7490234375, -122.431640625, 37.79296875, -122.3876953125]
  }
];

test('GeohashLayer', t => {
  const testCases = generateLayerTests({
    Layer: GeohashLayer,
    sampleProps: {
      data: TEST_DATA,
      getGeohash: d => d.geohash
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

  testLayer({Layer: GeohashLayer, testCases, onError: t.notOk});

  t.end();
});

test('GeohashLayer#getGeohashBounds', t => {
  for (const {geohash, expectedBounds} of TEST_DATA) {
    const bounds = getGeohashBounds(geohash);
    t.deepEquals(bounds, expectedBounds, 'Geohash bounds calculated');
  }

  t.end();
});

test('GeohashLayer#getGeohashPolygon', t => {
  for (const {geohash} of TEST_DATA) {
    const polygon = getGeohashPolygon(geohash);
    t.ok(polygon instanceof Array, 'polygon is flat array');
    t.is(polygon.length / 2 - 1, 4, 'polygon has 4 sides');
    t.deepEqual(polygon.slice(0, 2), polygon.slice(-2), 'polygon is closed');
  }

  t.end();
});
