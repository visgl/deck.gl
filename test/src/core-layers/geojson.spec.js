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
import {getGeojsonFeatures, separateGeojsonFeatures}
  from 'deck.gl/core-layers/geojson-layer/geojson';
import {toJS} from 'deck.gl/core/experimental/container';

const GEOMETRY = {type: 'Point'};
const FEATURE = {type: 'Feature', properties: [], geometry: GEOMETRY};
const FEATURE_COLLECTION = {type: 'FeatureCollection', features: [FEATURE]};

const TEST_CASES = [
  {
    title: 'geometry',
    argument: GEOMETRY,
    expected: [FEATURE]
  },
  {
    title: 'feature',
    argument: FEATURE,
    expected: [FEATURE]
  },
  {
    title: 'feature collection',
    argument: FEATURE_COLLECTION,
    expected: [FEATURE]
  }
];

test('geojson#import', t => {
  t.ok(typeof getGeojsonFeatures === 'function', 'getGeojsonFeatures imported OK');
  t.ok(typeof separateGeojsonFeatures === 'function', 'separateGeojsonFeatures imported OK');
  t.end();
});

test('geojson#getGeojsonFeatures', t => {
  for (const tc of TEST_CASES) {
    const result = getGeojsonFeatures(tc.argument);
    t.deepEqual(toJS(result), tc.expected, `getGeojsonFeatures ${tc.title} returned expected`);
    t.comment(JSON.stringify(result));
  }
  t.end();
});
