import test from 'tape-promise/tape';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {_QuadbinLayer as QuadbinLayer} from '@deck.gl/carto';
import {quadbinToWorldBounds, getQuadbinPolygon} from '@deck.gl/carto/layers/quadbin-utils';

const TEST_DATA = [
  {
    quadbin: '4813ffffffffffff', // quadkey '0'
    expectedBounds: [
      [0, 512],
      [253.44, 258.56]
    ]
  },
  {
    quadbin: '4841bfffffffffff', // quadkey 0123
    expectedBounds: [
      [160, 416],
      [191.68, 384.32]
    ]
  },
  {
    quadbin: '483fffffffffffff', // quadkey 333
    expectedBounds: [
      [448, 64],
      [511.36, 0.6399999999999864]
    ]
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

test('QuadbinLayer#quadbinToWorldBounds', t => {
  for (const {quadbin, expectedBounds} of TEST_DATA) {
    const bounds = quadbinToWorldBounds(quadbin);
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
