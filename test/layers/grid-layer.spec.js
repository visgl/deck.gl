import test from 'tape-catch';
import * as data from '../data';
import {testInitializeLayer} from '../test-utils';

import {GridLayer} from 'deck.gl';

test('GridLayer#constructor', t => {
  let layer = new GridLayer({
    id: 'emptyGeoJsonLayer',
    data: [],
    pickable: true
  });
  t.ok(layer instanceof GridLayer, 'Empty GridLayer created');

  layer = new GridLayer({
    data: data.points,
    pickable: true
  });
  t.ok(layer instanceof GridLayer, 'GridLayer created');

  testInitializeLayer({layer});

  t.doesNotThrow(
    () => new GridLayer({
      id: 'nullGridLayer',
      data: null,
      pickable: true
    }),
    'Null GridLayer did not throw exception'
  );

  t.end();
});
