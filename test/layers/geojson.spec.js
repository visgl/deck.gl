import test from 'tape-catch';
import {getGeojsonFeatures} from 'deck.gl/layers/deprecated/geojson-layer/geojson';
import {toJS} from 'deck.gl/lib/utils/container';

// import Immutable from 'immutable';
// import GEOJSON from '../data/geojson-data';
// const IMMUTABLE_GEOJSON = Immutable.fromJS(GEOJSON);

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
  t.ok(typeof getGeojsonFeatures === 'function', 'getGeojsonFeatures imported OK');
  t.end();
});

test('geojson#getGeojsonFeatures', t => {
  for (const tc of TEST_CASES) {
    const result = getGeojsonFeatures(tc.argument);
    t.deepEqual(toJS(result), tc.expected, `normalizeGeojson ${tc.title} returned expected result`);
    t.comment(JSON.stringify(result));
  }
  t.end();
});
