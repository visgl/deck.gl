import test from 'tape-catch';
import * as data from '../data';
import {testInitializeLayer} from '../test-utils';

import {PointDensityGridLayer} from 'deck.gl';

test('PointDensityGridLayer#constructor', t => {
  let layer = new PointDensityGridLayer({
    id: 'emptyGeoJsonLayer',
    data: [],
    pickable: true
  });
  t.ok(layer instanceof PointDensityGridLayer, 'Empty PointDensityGridLayer created');

  layer = new PointDensityGridLayer({
    data: data.points,
    pickable: true
  });
  t.ok(layer instanceof PointDensityGridLayer, 'PointDensityGridLayer created');

  testInitializeLayer({layer});

  t.doesNotThrow(
    () => new PointDensityGridLayer({
      id: 'nullPointDensityGridLayer',
      data: null,
      pickable: true
    }),
    'Null PointDensityGridLayer did not throw exception'
  );

  t.end();
});
