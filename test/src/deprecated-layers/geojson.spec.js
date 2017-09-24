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
import {extractPolygons, normalizeGeojson}
  from 'deck.gl/deprecated-layers/choropleth-layer/geojson';
import {toJS} from 'deck.gl/core/experimental/container';

import GEOJSON from 'deck.gl/test/data/geojson-data';

import Immutable from 'immutable';
const IMMUTABLE_GEOJSON = Immutable.fromJS(GEOJSON);

const GEOMETRY = {type: 'Point'};
const FEATURE = {type: 'Feature', properties: [], geometry: GEOMETRY};
const FEATURE_COLLECTION = {type: 'FeatureCollection', features: [FEATURE]};

const TEST_CASES_NORMALIZE = [
  {
    title: 'geometry',
    argument: GEOMETRY,
    expected: FEATURE_COLLECTION
  },
  {
    title: 'feature',
    argument: FEATURE,
    expected: FEATURE_COLLECTION
  },
  {
    title: 'feature collection',
    argument: FEATURE_COLLECTION,
    expected: FEATURE_COLLECTION
  }
];

test('geojson#import', t => {
  t.ok(typeof extractPolygons === 'function', 'extractPolygons imported OK');
  t.ok(typeof normalizeGeojson === 'function', 'normalizeGeojson imported OK');
  t.end();
});

test('geojson#normalizeGeojson', t => {
  for (const tc of TEST_CASES_NORMALIZE) {
    const result = normalizeGeojson(tc.argument);
    t.deepEqual(toJS(result), tc.expected, `normalizeGeojson ${tc.title} returned expected result`);
    t.comment(JSON.stringify(result));
  }
  t.end();
});

test('geojson#extractPolygons', t => {
  const polys = extractPolygons(GEOJSON);
  t.ok(polys, 'Extracted GeoJson');

  const immutablePolys = extractPolygons(IMMUTABLE_GEOJSON);
  t.ok(immutablePolys, 'Extracted Immutable GeoJson');

  // t.deepEqual(polys, toJS(immutablePolys), 'Immutable and standard GeoJson extraction equal');
  t.end();
});
