import test from 'tape-promise/tape';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {GeohashLayer} from '@deck.gl/geo-layers';
import {getGeohashPolygon} from '@deck.gl/geo-layers/geohash-layer/geohash-utils';

const TEST_DATA = [
  {
    geohash: '9q8yybj'
  },
  {
    geohash: '9q8yy'
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

test('GeohashLayer#getGeohashPolygon', t => {
  for (const {geohash} of TEST_DATA) {
    const polygon = getGeohashPolygon(geohash);
    t.ok(polygon instanceof Array, 'polygon is flat array');
    t.is(polygon.length / 2 - 1, 4, 'polygon has 4 sides');
    t.deepEqual(polygon.slice(0, 2), polygon.slice(-2), 'polygon is closed');
  }

  t.end();
});
