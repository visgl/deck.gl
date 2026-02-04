// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {S2Layer} from '@deck.gl/geo-layers';
import {getS2QuadKey, getS2Polygon} from '@deck.gl/geo-layers/s2-layer/s2-utils';
import {s2cells as data} from 'deck.gl-test/data';

import {S2} from 's2-geometry';
import Long from 'long';

test('S2Layer', () => {
  const testCases = generateLayerTests({
    Layer: S2Layer,
    sampleProps: {
      data,
      getS2Token: d => d.token
    },
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer, subLayer}) => {
      expect(subLayer, 'subLayers rendered').toBeTruthy();

      if (layer.props.data.length) {
        expect(subLayer.state.paths.length, 'should update PolygonLayers state.paths').toBe(
          data.length
        );
      }
    }
  });

  testLayer({
    createSpy: (obj, method) => vi.spyOn(obj, method),
    Layer: S2Layer,
    testCases,
    onError: err => expect(err).toBeFalsy()
  });
});

test('S2Layer#getS2QuadKey', () => {
  const TEST_COORDINATES = [
    {lat: 0, lng: 0},
    {lat: -122.45, lng: 37.78},
    {lat: 85, lng: 180}
  ];

  const TEST_LEVELS = [1, 2, 4, 8, 16];

  for (const point of TEST_COORDINATES) {
    for (const level of TEST_LEVELS) {
      const key = S2.latLngToKey(point.lat, point.lng, level);
      const id = Long.fromString(S2.keyToId(key), true);
      const token = id.toString(16).replace(/0+$/, '');

      console.log(`level ${level}, id: ${id.toString()}, token: ${token}`);
      expect(getS2QuadKey(key), 'Quad key to quad key').toBe(key);
      expect(getS2QuadKey(id), 'Id to quad key').toBe(key);
      expect(getS2QuadKey(token), 'Token to quad key').toBe(key);
    }
  }
});

test('S2Layer#getS2Polygon', () => {
  const TEST_TOKENS = [
    '80858004', // face 4
    '1c', // face 0
    '2c', // face 1
    '5b', // face 2
    '6b', // face 3
    'ab', // face 5
    '4/001003',
    '54', // antimeridian
    '5c', // antimeridian
    new Long(0, -2138636288, false),
    new Long(0, 1832910848, false)
  ];

  for (const token of TEST_TOKENS) {
    const polygon = getS2Polygon(token);
    expect(polygon instanceof Float64Array, 'polygon is flat array').toBeTruthy();
    expect((polygon.length / 2 - 1) % 4, 'polygon has 4 sides').toBe(0);
    expect(polygon.slice(0, 2), 'polygon is closed').toEqual(polygon.slice(-2));

    let minLng = 180;
    let maxLng = -180;
    for (let i = 0; i < polygon.length; i += 2) {
      minLng = Math.min(minLng, polygon[i]);
      maxLng = Math.max(maxLng, polygon[i]);
    }
    expect(maxLng - minLng < 180, 'longitude is adjusted cross the antimeridian').toBeTruthy();
  }
});
