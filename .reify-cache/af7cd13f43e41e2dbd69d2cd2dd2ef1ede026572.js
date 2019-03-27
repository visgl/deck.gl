"use strict";var test;module.link('tape-catch',{default(v){test=v}},0);var getGeojsonFeatures,separateGeojsonFeatures,unwrapSourceFeature,unwrapSourceFeatureIndex;module.link('@deck.gl/layers/geojson-layer/geojson',{getGeojsonFeatures(v){getGeojsonFeatures=v},separateGeojsonFeatures(v){separateGeojsonFeatures=v},unwrapSourceFeature(v){unwrapSourceFeature=v},unwrapSourceFeatureIndex(v){unwrapSourceFeatureIndex=v}},1);// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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
      pointFeaturesLength: 1,
      lineFeaturesLength: 0,
      polygonFeaturesLength: 0,
      polygonOutlineFeaturesLength: 0,
      pointSourceFeatures: [TEST_DATA.POINT],
      lineSourceFeatures: [],
      polygonSourceFeatures: [],
      polygonOutlineSourceFeatures: [],
      pointFeatureIndexes: [0],
      lineFeatureIndexes: [],
      polygonFeatureIndexes: [],
      polygonOutlineFeatureIndexes: []
    }
  },
  {
    title: 'geometry: MultiLineString',
    argument: TEST_DATA.MULTI_LINESTRING,
    expected: {
      pointFeaturesLength: 0,
      lineFeaturesLength: 2,
      polygonFeaturesLength: 0,
      polygonOutlineFeaturesLength: 0,
      pointSourceFeatures: [],
      lineSourceFeatures: [TEST_DATA.MULTI_LINESTRING, TEST_DATA.MULTI_LINESTRING],
      polygonSourceFeatures: [],
      polygonOutlineSourceFeatures: [],
      pointFeatureIndexes: [],
      lineFeatureIndexes: [0, 0],
      polygonFeatureIndexes: [],
      polygonOutlineFeatureIndexes: []
    }
  },
  {
    title: 'geometry: Polygon',
    argument: TEST_DATA.POLYGON,
    expected: {
      pointFeaturesLength: 0,
      lineFeaturesLength: 0,
      polygonFeaturesLength: 1,
      polygonOutlineFeaturesLength: 1,
      pointSourceFeatures: [],
      lineSourceFeatures: [],
      polygonSourceFeatures: [TEST_DATA.POLYGON],
      polygonOutlineSourceFeatures: [TEST_DATA.POLYGON],
      pointFeatureIndexes: [],
      lineFeatureIndexes: [],
      polygonFeatureIndexes: [0],
      polygonOutlineFeatureIndexes: [0]
    }
  },
  {
    title: 'GeometryCollection',
    argument: TEST_DATA.GEOMETRY_COLLECTION,
    expected: {
      pointFeaturesLength: 1,
      lineFeaturesLength: 1,
      polygonFeaturesLength: 0,
      polygonOutlineFeaturesLength: 0,
      pointSourceFeatures: [TEST_DATA.GEOMETRY_COLLECTION],
      lineSourceFeatures: [TEST_DATA.GEOMETRY_COLLECTION],
      polygonSourceFeatures: [],
      polygonOutlineSourceFeatures: [],
      pointFeatureIndexes: [0],
      lineFeatureIndexes: [0],
      polygonFeatureIndexes: [],
      polygonOutlineFeatureIndexes: []
    }
  },
  {
    title: 'feature: MultiPoint',
    argument: {type: 'Feature', properties: {}, geometry: TEST_DATA.MULTI_POINT},
    expected: {
      pointFeaturesLength: 2,
      lineFeaturesLength: 0,
      polygonFeaturesLength: 0,
      polygonOutlineFeaturesLength: 0,
      pointSourceFeatures: [TEST_DATA.MULTI_POINT, TEST_DATA.MULTI_POINT],
      lineSourceFeatures: [],
      polygonSourceFeatures: [],
      polygonOutlineSourceFeatures: [],
      pointFeatureIndexes: [0, 0],
      lineFeatureIndexes: [],
      polygonFeatureIndexes: [],
      polygonOutlineFeatureIndexes: []
    }
  },
  {
    title: 'feature: LineString',
    argument: {type: 'Feature', properties: {}, geometry: TEST_DATA.LINESTRING},
    expected: {
      pointFeaturesLength: 0,
      lineFeaturesLength: 1,
      polygonFeaturesLength: 0,
      polygonOutlineFeaturesLength: 0,
      pointSourceFeatures: [],
      lineSourceFeatures: [TEST_DATA.LINESTRING],
      polygonSourceFeatures: [],
      polygonOutlineSourceFeatures: [],
      pointFeatureIndexes: [],
      lineFeatureIndexes: [0],
      polygonFeatureIndexes: [],
      polygonOutlineFeatureIndexes: []
    }
  },
  {
    title: 'feature: MultiPolygon',
    argument: {type: 'Feature', properties: {}, geometry: TEST_DATA.MULTI_POLYGON},
    expected: {
      pointFeaturesLength: 0,
      lineFeaturesLength: 0,
      polygonFeaturesLength: 2,
      polygonOutlineFeaturesLength: 3,
      pointSourceFeatures: [],
      lineSourceFeatures: [],
      polygonSourceFeatures: [TEST_DATA.MULTI_POLYGON, TEST_DATA.MULTI_POLYGON],
      polygonOutlineSourceFeatures: [
        TEST_DATA.MULTI_POLYGON,
        TEST_DATA.MULTI_POLYGON,
        TEST_DATA.MULTI_POLYGON
      ],
      pointFeatureIndexes: [],
      lineFeatureIndexes: [],
      polygonFeatureIndexes: [0, 0],
      polygonOutlineFeatureIndexes: [0, 0, 0]
    }
  },
  {
    title: 'empty data',
    argument: [],
    expected: {
      pointFeaturesLength: 0,
      lineFeaturesLength: 0,
      polygonFeaturesLength: 0,
      polygonOutlineFeaturesLength: 0,
      pointSourceFeatures: [],
      lineSourceFeatures: [],
      polygonSourceFeatures: [],
      polygonOutlineSourceFeatures: [],
      pointFeatureIndexes: [],
      lineFeatureIndexes: [],
      polygonFeatureIndexes: [],
      polygonOutlineFeatureIndexes: []
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
      pointFeaturesLength: 3,
      lineFeaturesLength: 3,
      polygonFeaturesLength: 3,
      polygonOutlineFeaturesLength: 4,
      pointSourceFeatures: [TEST_DATA.POINT, TEST_DATA.MULTI_POINT, TEST_DATA.MULTI_POINT],
      lineSourceFeatures: [
        TEST_DATA.LINESTRING,
        TEST_DATA.MULTI_LINESTRING,
        TEST_DATA.MULTI_LINESTRING
      ],
      polygonSourceFeatures: [TEST_DATA.POLYGON, TEST_DATA.MULTI_POLYGON, TEST_DATA.MULTI_POLYGON],
      polygonOutlineSourceFeatures: [
        TEST_DATA.POLYGON,
        TEST_DATA.MULTI_POLYGON,
        TEST_DATA.MULTI_POLYGON,
        TEST_DATA.MULTI_POLYGON
      ],
      pointFeatureIndexes: [0, 1, 1],
      lineFeatureIndexes: [2, 3, 3],
      polygonFeatureIndexes: [4, 5, 5],
      polygonOutlineFeatureIndexes: [4, 5, 5, 5]
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
      const actual = {
        pointFeaturesLength: result.pointFeatures.length,
        lineFeaturesLength: result.lineFeatures.length,
        polygonFeaturesLength: result.polygonFeatures.length,
        polygonOutlineFeaturesLength: result.polygonOutlineFeatures.length,
        pointSourceFeatures: result.pointFeatures.map(f => unwrapSourceFeature(f).geometry),
        lineSourceFeatures: result.lineFeatures.map(f => unwrapSourceFeature(f).geometry),
        polygonSourceFeatures: result.polygonFeatures.map(f => unwrapSourceFeature(f).geometry),
        polygonOutlineSourceFeatures: result.polygonOutlineFeatures.map(
          f => unwrapSourceFeature(f).geometry
        ),
        pointFeatureIndexes: result.pointFeatures.map(f => unwrapSourceFeatureIndex(f)),
        lineFeatureIndexes: result.lineFeatures.map(f => unwrapSourceFeatureIndex(f)),
        polygonFeatureIndexes: result.polygonFeatures.map(f => unwrapSourceFeatureIndex(f)),
        polygonOutlineFeatureIndexes: result.polygonOutlineFeatures.map(f =>
          unwrapSourceFeatureIndex(f)
        )
      };
      t.deepEquals(
        actual,
        tc.expected,
        `separateGeojsonFeatures ${tc.title} returned expected result`
      );
    }
  }
  t.end();
});
