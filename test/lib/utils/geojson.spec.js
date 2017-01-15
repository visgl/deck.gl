import test from 'tape-catch';
import {normalizeGeojson, extractPolygons} from 'deck.gl/lib/utils';
import {toJS} from 'deck.gl/lib/utils/container';

import GEOJSON from './geojson-data';
import Immutable from 'immutable';
const IMMUTABLE_GEOJSON = Immutable.fromJS(GEOJSON);

const GEOMETRY = {type: 'Point'};
const FEATURE = {type: 'Feature', properties: [], geometry: GEOMETRY};
const FEATURE_COLLECTION = {type: 'FeatureCollection', features: [FEATURE]};

const TEST_CASES = [
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
  // Doesn't work with current limitations of buble compiler
  // {
  //   title: 'geometry (ES6 Map)',
  //   argument: objectToMap(GEOMETRY),
  //   expected: FEATURE_COLLECTION
  // },
  // {
  //   title: 'feature (ES6 Map)',
  //   argument: objectToMap(FEATURE),
  //   expected: FEATURE_COLLECTION
  // },
  // {
  //   title: 'feature collection (ES6 Map)',
  //   argument: objectToMap(FEATURE_COLLECTION),
  //   expected: FEATURE_COLLECTION
  // }
];

// Doesn't work with current limitations of buble compiler
// function objectToMap(object, MapType = Map) {
//   if (Array.isArray(object)) {
//     return object.map(element => objectToMap(element));
//   }
//   if (typeof object !== 'object' || object === null || object.constructor !== Object) {
//     return object;
//   }
//   let map = new MapType();
//   for (const key in object) {
//     if (object.hasOwnProperty(key)) {
//       map = map.set(key, objectToMap(object[key], MapType));
//     }
//   }
//   return map;
// }

test('geojson#import', t => {
  t.ok(typeof normalizeGeojson === 'function', 'normalizeGeojson imported OK');
  t.ok(typeof extractPolygons === 'function', 'extractPolygons imported OK');
  t.end();
});

test('geojson#normalizeGeojson', t => {
  for (const tc of TEST_CASES) {
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

  t.deepEqual(polys, immutablePolys, 'Immutable and standard GeoJson extraction equal');
  t.end();
});
