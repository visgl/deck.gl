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
import {
  getGeojsonFeatures,
  separateGeojsonFeatures
} from '@deck.gl/core-layers/geojson-layer/geojson';

const TEST_DATA = {
  POINT: {
    type: 'Point',
    coordinates: [100.0, 0.0]
  },
  LINESTRING: {
    type: 'LineString',
    coordinates: [[100.0, 0.0], [101.0, 1.0]]
  },
  POLYGON: {
    type: 'Polygon',
    coordinates: [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]]]
  },
  MULTI_POINT: {
    type: 'MultiPoint',
    coordinates: [[100.0, 0.0], [101.0, 1.0]]
  },
  MULTI_LINESTRING: {
    type: 'MultiLineString',
    coordinates: [[[100.0, 0.0], [101.0, 1.0]], [[102.0, 2.0], [103.0, 3.0]]]
  },
  MULTI_POLYGON: {
    type: 'MultiPolygon',
    coordinates: [
      [[[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]],
      [
        [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
        [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]
      ]
    ]
  },
  GEOMETRY_COLLECTION: {
    type: 'GeometryCollection',
    geometries: [
      {
        type: 'Point',
        coordinates: [100.0, 0.0]
      },
      {
        type: 'LineString',
        coordinates: [[101.0, 0.0], [102.0, 1.0]]
      }
    ]
  }
};

const TEST_CASES = [
  {
    title: 'geometry: Point',
    argument: TEST_DATA.POINT,
    expected: {
      pointFeatures: 1,
      lineFeatures: 0,
      polygonFeatures: 0,
      polygonOutlineFeatures: 0
    }
  },
  {
    title: 'geometry: MultiLineString',
    argument: TEST_DATA.MULTI_LINESTRING,
    expected: {
      pointFeatures: 0,
      lineFeatures: 2,
      polygonFeatures: 0,
      polygonOutlineFeatures: 0
    }
  },
  {
    title: 'geometry: Polygon',
    argument: TEST_DATA.POLYGON,
    expected: {
      pointFeatures: 0,
      lineFeatures: 0,
      polygonFeatures: 1,
      polygonOutlineFeatures: 1
    }
  },
  {
    title: 'GeometryCollection',
    argument: TEST_DATA.GEOMETRY_COLLECTION,
    expected: {
      pointFeatures: 1,
      lineFeatures: 1,
      polygonFeatures: 0,
      polygonOutlineFeatures: 0
    }
  },
  {
    title: 'feature: MultiPoint',
    argument: {type: 'Feature', properties: {}, geometry: TEST_DATA.MULTI_POINT},
    expected: {
      pointFeatures: 2,
      lineFeatures: 0,
      polygonFeatures: 0,
      polygonOutlineFeatures: 0
    }
  },
  {
    title: 'feature: LineString',
    argument: {type: 'Feature', properties: {}, geometry: TEST_DATA.LINESTRING},
    expected: {
      pointFeatures: 0,
      lineFeatures: 1,
      polygonFeatures: 0,
      polygonOutlineFeatures: 0
    }
  },
  {
    title: 'feature: MultiPolygon',
    argument: {type: 'Feature', properties: {}, geometry: TEST_DATA.MULTI_POLYGON},
    expected: {
      pointFeatures: 0,
      lineFeatures: 0,
      polygonFeatures: 2,
      polygonOutlineFeatures: 3
    }
  },
  {
    title: 'empty data',
    argument: [],
    expected: {
      pointFeatures: 0,
      lineFeatures: 0,
      polygonFeatures: 0,
      polygonOutlineFeatures: 0
    }
  },
  {
    title: 'FeatureCollection',
    argument: {
      type: 'FeatureCollection',
      features: [
        {type: 'Feature', properties: {}, geometry: TEST_DATA.POINT},
        {type: 'Feature', properties: {}, geometry: TEST_DATA.MULTI_POINT},
        {type: 'Feature', properties: {}, geometry: TEST_DATA.LINESTRING},
        {type: 'Feature', properties: {}, geometry: TEST_DATA.MULTI_LINESTRING},
        {type: 'Feature', properties: {}, geometry: TEST_DATA.POLYGON},
        {type: 'Feature', properties: {}, geometry: TEST_DATA.MULTI_POLYGON}
      ]
    },
    expected: {
      pointFeatures: 3,
      lineFeatures: 3,
      polygonFeatures: 3,
      polygonOutlineFeatures: 4
    }
  },
  {
    title: 'malformed geojson',
    argument: {},
    error: /does not have type/i
  },
  {
    title: 'malformed geojson',
    argument: {type: 'Feature'},
    error: /does not have geometry/i
  },
  {
    title: 'malformed geojson: GeometryCollection',
    argument: {type: 'GeometryCollection'},
    error: /does not have geometries/i
  },
  {
    title: 'malformed geojson: FeatureCollection',
    argument: {type: 'FeatureCollection'},
    error: /does not have features/i
  },
  {
    title: 'unknown geojson type',
    argument: {type: 'Feature', geometry: {type: 'Something', coordinates: [0, 0]}},
    error: /unknown geojson type/i
  },
  {
    title: 'malformed geojson: Point',
    argument: {type: 'Point'},
    error: /coordinates are malformed/i
  },
  {
    title: 'malformed geojson: Point',
    argument: {type: 'Point', coordinates: 1},
    error: /coordinates are malformed/i
  },
  {
    title: 'malformed geojson: Point',
    argument: {type: 'Point', coordinates: [[0, 0]]},
    error: /coordinates are malformed/i
  },
  {
    title: 'malformed geojson: Polygon',
    argument: {type: 'Polygon', coordinates: [[0, 0]]},
    error: /coordinates are malformed/i
  },
  {
    title: 'malformed geojson: MultiPolygon',
    argument: {type: 'MultiPolygon', coordinates: [[[0, 0]]]},
    error: /coordinates are malformed/i
  }
];

test('geojson#import', t => {
  t.ok(typeof getGeojsonFeatures === 'function', 'getGeojsonFeatures imported OK');
  t.ok(typeof separateGeojsonFeatures === 'function', 'separateGeojsonFeatures imported OK');
  t.end();
});

test('geojson#getGeojsonFeatures, separateGeojsonFeatures', t => {
  for (const tc of TEST_CASES) {
    if (tc.error) {
      t.throws(
        () => {
          const featureArray = getGeojsonFeatures(tc.argument);
          separateGeojsonFeatures(featureArray);
        },
        tc.error,
        `separateGeojsonFeatures ${tc.title} throws error`
      );
    } else {
      const featureArray = getGeojsonFeatures(tc.argument);
      t.ok(Array.isArray(featureArray), `getGeojsonFeatures ${tc.title} returned array`);

      const result = separateGeojsonFeatures(featureArray);
      const stats = {};
      for (const key in result) {
        stats[key] = result[key].length;
      }
      t.deepEquals(
        stats,
        tc.expected,
        `separateGeojsonFeatures ${tc.title} returned expected result`
      );
    }
  }
  t.end();
});
