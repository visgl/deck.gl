import test from 'tape-catch';
import {testInitializeLayer, toLowPrecision} from '../test-utils';

import {HexagonLayer} from 'deck.gl';

const HEXAGONS = [
  {centroid: [37, 122]}, {centroid: [37.1, 122.8]}
];

test('HexagonLayer#constructor', t => {

  let layer = new HexagonLayer({
    id: 'emptyhexagonLayer',
    data: [],
    pickable: true
  });
  t.ok(layer instanceof HexagonLayer, 'Empty HexagonLayer created');

  layer = new HexagonLayer({
    data: HEXAGONS,
    pickable: true
  });
  t.ok(layer instanceof HexagonLayer, 'HexagonLayer created');

  testInitializeLayer({layer});
  t.ok(layer.state.model, 'HexagonLayer has state');

  t.doesNotThrow(
    () => new HexagonLayer({
      id: 'nullHexagonLayer',
      data: null,
      pickable: true
    }),
    'Null HexagonLayer did not throw exception'
  );

  layer = new HexagonLayer({
    data: [],
    pickable: true
  });

  t.equal(layer.props.radius, 1000, 'Use default radius if not specified');
  t.equal(layer.props.angle, 0, 'Use default angel if not specified');

  t.end();
});

test('HexagonLayer#updateRadiusAngle', t => {
  const layer = new HexagonLayer({
    data: [],
    pickable: true,
    hexagonVertices: [
      [-122.3993347, 37.79178708],
      [-122.4021036, 37.79398118],
      [-122.4060099, 37.79308171],
      [-122.4071472, 37.78998822],
      [-122.4043784, 37.78779417],
      [-122.4004722, 37.78869356]
    ],
    radius: 10,
    angle: 10
  });

  testInitializeLayer({layer});
  /* eslint-disable no-console */
  /* eslint-disable no-undef */

  console.log(layer);
  /* eslint-enable no-console */

  layer.updateRadiusAngle();
  t.equal(toLowPrecision(layer.state.model.uniforms.angle, 5), 1.8543,
    'Use hexagonVertices instead of radius and angle if both provided');

  t.end();
});
