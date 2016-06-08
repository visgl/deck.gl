import test from 'tape-catch';
import {mat4} from 'gl-matrix';
import Viewport, {MapboxTransform} from '../src/viewport';

/* eslint-disable max-len */
const VIEWPORT_TEST_DATA = [{
  mapState: {
    height: 389,
    width: 1821,
    latitude: 37.751537058389985,
    longitude: -122.42694203247012,
    zoom: 11.5,
    bearing: 0,
    pitch: 0,
    altitude: 1.5
  },
  matrix: [
    0.0016474464579901227, 0, 0, 0,
    0, -0.0077120822622108315, 0, 0,
    0, 0, -0.0029379360998898277, -0.002570694087403599,
    -390.6996450744531, 4421.318644674351, 1.5, 1.5
  ]
}, {
  mapState: {
    width: 793,
    height: 775,
    latitude: 37.751537058389985,
    longitude: -122.42694203247012,
    zoom: 11.5,
    bearing: -44.48928121059271,
    pitch: 43.670797287818566
    // altitude: undefined
  },
  matrix: [
    0.0026987954042851925, -0.001962133916094899, -0.0006838429835624993, -0.0006243811803869903,
    -0.0026511065661907196, -0.0019974291790276766, -0.0006961441249586642, -0.0006356127560138702,
    0, 0.0026729567907750607, -0.001022197655402124, -0.0009333151392638683,
    879.8411865234375, 1610.45068359375, 562.7077026367188, 513.97021484375
  ]
}];

test('MapboxTransform projection matrix', t => {
  for (const testData of VIEWPORT_TEST_DATA) {
    const viewport = new MapboxTransform(testData.mapState);
    const projectionMatrix = viewport.projMatrix;

    t.ok(mat4.equals(projectionMatrix, testData.matrix), 'Gets expected matrix');
  }
  t.end();
});

test('Viewport projection matrix', t => {
  for (const testData of VIEWPORT_TEST_DATA) {
    const viewport = new Viewport(testData.mapState);
    const projectionMatrix = viewport.getZoomedViewProjectionMatrix();

    t.ok(mat4.equals(projectionMatrix, testData.matrix), 'Gets expected matrix');
  }
  t.end();
});

