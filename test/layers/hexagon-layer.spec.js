import test from 'tape-catch';
import * as data from '../data';
import {testInitializeLayer} from '../test-utils';

import {HexagonLayer} from 'deck.gl';

test('HexagonLayer#constructor', t => {
  let layer = new HexagonLayer({
    id: 'emptyGeoJsonLayer',
    data: [],
    pickable: true
  });
  t.ok(layer instanceof HexagonLayer, 'Empty HexagonLayer created');

  layer = new HexagonLayer({
    data: data.points,
    pickable: true
  });
  t.ok(layer instanceof HexagonLayer, 'HexagonLayer created');

  layer = new HexagonLayer({
    data: data.points,
    radius: null,
    pickable: true
  });
  t.ok(layer instanceof HexagonLayer, 'HexagonLayer created');
  t.equal(layer.props.radius, 1000, 'set to default radius if not speicified');

  testInitializeLayer({layer});

  t.doesNotThrow(
    () => new HexagonLayer({
      id: 'nullHexagonLayer',
      data: null,
      pickable: true
    }),
    'Null HexagonLayer did not throw exception'
  );

  t.end();
});
