import test from 'tape-catch';
import {mat4} from 'gl-matrix';
import Viewport, {MapboxTransform} from '../viewport';

/* eslint-disable */
const VIEWPORT_TEST_DATA = [
// {
//   mapState: {
//     height: 389,
//     width: 1821,
//     latitude: 37.751537058389985,
//     longitude: -122.42694203247012,
//     zoom: 11.5,
//     bearing: 0,
//     pitch: 0,
//     altitude: 1.5
//   },
//   matrixZoomed: new Float32Array([
//     0.0016474464579901227, 0, 0, 0,
//     0, -0.0077120822622108315, 0, 0,
//     0, 0, -0.0029379360998898277, -0.002570694087403599,
//     -390.6996450744531, 4421.318644674351, 1.5, 1.5
//   ]),
//   matrixWorld: new Float32Array([
//     7.816546440124512, -5.682946681976318, -1.9806208610534668,
//     -1.808401107788086,
//     -7.678424835205078, -5.785172939300537, -2.0162487030029297,
//     -1.8409311771392822,
//     0, 7.7417097091674805, -2.9606006145477295, -2.703169345855713,
//     879.8411865234375, 1610.45068359375, 562.7077026367188, 513.97021484375
//   ])
// },
  {
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
    matrixZoomed: new Float32Array([
      0.0026987954042851925, -0.001962133916094899, -0.0006838429835624993,
      -0.0006243811803869903,
      -0.0026511065661907196, -0.0019974291790276766, -0.0006961441249586642,
      -0.0006356127560138702,
      0, 0.0026729567907750607, -0.001022197655402124, -0.0009333151392638683,
      879.8411865234375, 1610.45068359375, 562.7077026367188, 513.97021484375
    ]),
    matrixWorld: new Float32Array([
      7.816546440124512, -5.682946681976318, -1.9806208610534668,
      -1.808401107788086,
      -7.678424835205078, -5.785172939300537, -2.0162487030029297,
      -1.8409311771392822,
      0, 7.7417097091674805, -2.9606006145477295, -2.703169345855713,
      879.8411865234375, 1610.45068359375, 562.7077026367188, 513.97021484375
    ])
  }
];

test('MapboxTransform projection matrix', t => {
  for (const testData of VIEWPORT_TEST_DATA) {
    const viewport = new MapboxTransform(testData.mapState);
    const projectionMatrix = viewport.projMatrix;

    t.ok(mat4.equals(projectionMatrix, testData.matrixZoomed),
      'MapboxTransform gets expected matrix');
  }
  t.end();
});

test('Viewport projection matrix', t => {
  for (const testData of VIEWPORT_TEST_DATA) {
    const viewport = new Viewport(testData.mapState);
    const projectionMatrix = viewport.getProjectionMatrix();

    t.ok(mat4.equals(projectionMatrix, testData.matrixZoomed),
      'Viewport gets expected matrix');
  }
  t.end();
});

