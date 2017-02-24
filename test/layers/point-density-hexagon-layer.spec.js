import test from 'tape-catch';
import * as data from '../data';
import {testInitializeLayer} from '../test-utils';

import {PointDensityHexagonLayer} from 'deck.gl';

test('PointDensityHexagonLayer#constructor', t => {
  let layer = new PointDensityHexagonLayer({
    id: 'emptyGeoJsonLayer',
    data: [],
    pickable: true
  });
  t.ok(layer instanceof PointDensityHexagonLayer, 'Empty PointDensityHexagonLayer created');

  layer = new PointDensityHexagonLayer({
    data: data.points,
    pickable: true
  });
  t.ok(layer instanceof PointDensityHexagonLayer, 'PointDensityHexagonLayer created');

  layer = new PointDensityHexagonLayer({
    data: data.points,
    radius: null,
    pickable: true
  });
  t.ok(layer instanceof PointDensityHexagonLayer, 'PointDensityHexagonLayer created');
  t.equal(layer.props.radius, 1000, 'set to default radius if not speicified');

  testInitializeLayer({layer});

  t.doesNotThrow(
    () => new PointDensityHexagonLayer({
      id: 'nullPointDensityHexagonLayer',
      data: null,
      pickable: true
    }),
    'Null PointDensityHexagonLayer did not throw exception'
  );

  t.end();
});
