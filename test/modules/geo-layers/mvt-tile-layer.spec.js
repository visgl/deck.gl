import test from 'tape-catch';
import {generateLayerTests, testLayer} from '@deck.gl/test-utils';
import {MVTTileLayer} from '@deck.gl/geo-layers';

test('MVTTileLayer', t => {
  const testCases = generateLayerTests({
    Layer: MVTTileLayer,
    assert: t.ok,
    sampleProps: {
      urlTemplates: [
        'https://a.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png'
      ]
    },
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });
  testLayer({Layer: MVTTileLayer, testCases, onError: t.notOk});
  t.end();
});
