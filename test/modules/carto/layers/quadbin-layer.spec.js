import test from 'tape-promise/tape';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import QuadbinLayer from '@deck.gl/carto/layers/quadbin-layer';
import {
  quadbinToOffset,
  quadbinToWorldBounds,
  getQuadbinPolygon
} from '@deck.gl/carto/layers/quadbin-utils';

const TEST_DATA = [
  {
    quadbin: 5193776270265024511n, // quadkey '0'
    coverage: 1,
    expectedBounds: [
      [0, 512],
      [256, 256]
    ],
    expectedOffset: [0, 512, 256]
  },
  {
    quadbin: 5193776270265024511n, // quadkey '0'
    coverage: 0.99,
    expectedBounds: [
      [0, 512],
      [253.44, 258.56]
    ],
    expectedOffset: [0, 512, 256]
  },
  {
    quadbin: 5206653750449537023n, // quadkey 0123
    coverage: 0.99,
    expectedBounds: [
      [160, 416],
      [191.68, 384.32]
    ],
    expectedOffset: [160, 416, 32]
  },
  {
    quadbin: 5206161169240293375n, // quadkey 333
    coverage: 0.99,
    expectedBounds: [
      [448, 64],
      [511.36, 0.6400000000000006]
    ],
    expectedOffset: [448, 64, 64]
  }
];

test('QuadbinLayer', t => {
  const testCases = generateLayerTests({
    Layer: QuadbinLayer,
    sampleProps: {
      data: TEST_DATA,
      getQuadbin: d => d.quadbin
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({layer, subLayer}) => {
      t.ok(subLayer, 'subLayers rendered');

      if (layer.props.data.length) {
        t.equal(
          subLayer.state.paths.length,
          TEST_DATA.length,
          'should update PolygonLayers state.paths'
        );
      }
    }
  });

  testLayer({Layer: QuadbinLayer, testCases, onError: t.notOk});

  t.end();
});

test('QuadbinLayer#quadbinToOffset', t => {
  for (const {quadbin, expectedOffset} of TEST_DATA) {
    const offset = quadbinToOffset(quadbin);
    t.deepEquals(offset, expectedOffset, 'Quadbin offset calculated');
  }

  t.end();
});

test('QuadbinLayer#quadbinToWorldBounds', t => {
  for (const {quadbin, coverage, expectedBounds} of TEST_DATA) {
    const bounds = quadbinToWorldBounds(quadbin, coverage);
    t.deepEquals(bounds, expectedBounds, 'Quadbin bounds calculated');
  }

  t.end();
});

test('QuadbinLayer#getQuadbinPolygon', t => {
  for (const {quadbin} of TEST_DATA) {
    const polygon = getQuadbinPolygon(quadbin);
    t.ok(polygon instanceof Array, 'polygon is flat array');
    t.is(polygon.length / 2 - 1, 4, 'polygon has 4 sides');
    t.deepEqual(polygon.slice(0, 2), polygon.slice(-2), 'polygon is closed');
  }

  t.end();
});
