import test from 'tape-catch';
import Viewport from '../src/viewport';

test('Basic functionality', t => {
  const mapViewState = {
    altitude: 1.5,
    bearing: 0,
    height: 389,
    latitude: 37.751537058389985,
    longitude: -122.42694203247012,
    pitch: 0,
    width: 1821,
    zoom: 11.5
  };

  const expectedResult = [
    0.0016474464579901227, 0, 0, 0, 0,
    -0.0077120822622108315, 0, 0, 0, 0,
    -0.0029379360998898277, -0.002570694087403599,
    -390.6996450744531, 4421.318644674351, 1.5, 1.5
  ];

  const projectionMatrix = new Viewport(mapViewState).getProjectionMatrix();

  t.deepEqual(projectionMatrix, expectedResult, 'Gets expected result');
  t.end();
});

