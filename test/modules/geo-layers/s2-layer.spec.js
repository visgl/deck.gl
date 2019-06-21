// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import test from 'tape-catch';
import {testLayer} from '@deck.gl/test-utils';
import {S2Layer} from '@deck.gl/geo-layers';
import {getS2QuadKey} from '@deck.gl/geo-layers/s2-layer/s2-utils';
import data from 'deck.gl-test/data/s2-sf.json';

import {S2} from 's2-geometry';
import Long from 'long';

test('S2Layer#constructor', t => {
  testLayer({
    Layer: S2Layer,
    onError: t.notOk,
    testCases: [
      {props: []},
      {props: null},
      {
        props: {
          data,
          getPolygon: f => f
        }
      },
      {
        updateProps: {
          filled: false
        },
        onAfterUpdate({layer, subLayers, oldState}) {
          t.ok(layer.state, 'should update layer state');
          t.ok(subLayers.length, 'subLayers rendered');

          const polygonLayer = layer.internalState.subLayers[0];
          t.equal(
            polygonLayer.state.paths.length,
            data.length,
            'should update PolygonLayers state.paths'
          );
        }
      }
    ]
  });

  t.end();
});

test('S2Layer#getS2QuadKey', t => {
  const TEST_COORDINATES = [{lat: 0, lng: 0}, {lat: -122.45, lng: 37.78}, {lat: 85, lng: 180}];

  const TEST_LEVELS = [1, 2, 4, 8, 16];

  for (const point of TEST_COORDINATES) {
    for (const level of TEST_LEVELS) {
      const key = S2.latLngToKey(point.lat, point.lng, level);
      const id = Long.fromString(S2.keyToId(key), true);
      const token = id.toString(16).replace(/0+$/, '');

      t.comment(`level ${level}, id: ${id.toString()}, token: ${token}`);
      t.is(getS2QuadKey(key), key, 'Quad key to quad key');
      t.is(getS2QuadKey(id), key, 'Id to quad key');
      t.is(getS2QuadKey(token), key, 'Token to quad key');
    }
  }

  t.end();
});
