import test from 'tape-catch';
import * as data from '../data';
import {testInitializeLayer} from '../test-utils';

import {GeoJsonLayer} from 'deck.gl';

test('GeoJsonLayer#constructor', t => {
  let layer = new GeoJsonLayer({
    id: 'emptyGeoJsonLayer',
    data: [],
    pickable: true
  });
  t.ok(layer instanceof GeoJsonLayer, 'Empty GeoJsonLayer created');

  layer = new GeoJsonLayer({
    data: data.choropleths,
    pickable: true
  });
  t.ok(layer instanceof GeoJsonLayer, 'GeoJsonLayer created');

  testInitializeLayer({layer});
  // t.ok(layer.state.subLayers, 'GeoJsonLayer has subLayers');

  layer = new GeoJsonLayer({
    data: data.immutableChoropleths,
    pickable: true
  });
  t.ok(layer instanceof GeoJsonLayer, 'GeoJsonLayer created');

  t.doesNotThrow(
    () => new GeoJsonLayer({
      id: 'nullGeoJsonLayer',
      data: null,
      pickable: true
    }),
    'Null GeoJsonLayer did not throw exception'
  );

  t.end();
});
