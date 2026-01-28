// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
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

test('GeohashLayer', () => {
  const testCases = generateLayerTests({
    Layer: GeohashLayer,
    sampleProps: {
      data: TEST_DATA,
      getGeohash: d => d.geohash
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

  testLayer({Layer: GeohashLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('GeohashLayer#getGeohashBounds', () => {
  for (const {geohash, expectedBounds} of TEST_DATA) {
    const bounds = getGeohashBounds(geohash);
    expect(bounds, 'Geohash bounds calculated').toEqual(expectedBounds);
  }
});

test('GeohashLayer#getGeohashPolygon', () => {
  for (const {geohash} of TEST_DATA) {
    const polygon = getGeohashPolygon(geohash);
    expect(polygon instanceof Array, 'polygon is flat array').toBeTruthy();
    expect(polygon.length / 2 - 1, 'polygon has 4 sides').toBe(4);
    expect(polygon.slice(0, 2), 'polygon is closed').toEqual(polygon.slice(-2));
  }
});
