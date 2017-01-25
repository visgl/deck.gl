import test from 'tape-catch';
import {extractPolygons, normalizeGeojson}
  from 'deck.gl/layers/deprecated/choropleth-layer/geojson';
import {toJS} from 'deck.gl/lib/utils/container';

import GEOJSON from '../data/geojson-data';

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

  t.deepEqual(polys, immutablePolys, 'Immutable and standard GeoJson extraction equal');
  t.end();
});
