import test from 'tape-promise/tape';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {GeohashLayer} from '@deck.gl/geo-layers';

const TEST_DATA = [
  {
    geohash: '9q8yybj',
    expectedBounds: [
      [-122.3876953125, 37.750396728515625],
      [-122.38906860351562, 37.7490234375]
    ]
  }
];

test('GeohashLayer', t => {
  const testCases = generateLayerTests({
    Layer: GeohashLayer,
    sampleProps: {
      data: TEST_DATA,
      getGeohash: d => d.geohash
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

  testLayer({Layer: GeohashLayer, testCases, onError: t.notOk});

  t.end();
});
