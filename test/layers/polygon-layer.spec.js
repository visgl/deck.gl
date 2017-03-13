import test from 'tape-catch';
import * as data from '../data';
import {testInitializeLayer} from '../test-utils';

import {PolygonLayer} from 'deck.gl';

const POLYGONS = [
  [],
  [[1, 1]],
  [[1, 1], [1, 1], [1, 1]],
  [[]],
  [[[1, 1]]],
  [[[1, 1], [1, 1], [1, 1]]]
];

test('PolygonLayer#constructor', t => {

  let layer = new PolygonLayer({
    id: 'emptyPolygonLayer',
    data: [],
    pickable: true
  });
  t.ok(layer instanceof PolygonLayer, 'Empty PolygonLayer created');

  layer = new PolygonLayer({
    data: POLYGONS,
    getPolygon: x => x
  });
  t.ok(layer instanceof PolygonLayer, 'PolygonLayer created');

  layer = new PolygonLayer({
    data: data.choropleths
  });
  t.ok(layer instanceof PolygonLayer, 'PolygonLayer created');

  testInitializeLayer({layer});
  // t.ok(layer.state.model, 'PolygonLayer has state');

  t.doesNotThrow(
    () => new PolygonLayer({
      id: 'nullPolygonLayer',
      data: null
    }),
    'Null PolygonLayer did not throw exception'
  );

  t.end();
});
