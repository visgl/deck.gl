import test from 'tape-catch';
import {generateLayerTests, testLayer} from '@deck.gl/test-utils';
import {MVTTileLayer} from '@deck.gl/geo-layers';
import ClipExtension from '@deck.gl/geo-layers/mvt-tile-layer/clip-extension';
import {GeoJsonLayer} from '@deck.gl/layers';

import * as FIXTURES from 'deck.gl-test/data';

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

test('ClipExtension', t => {
  const testCases = [
    {
      props: {
        id: 'clip-extension-test',
        data: FIXTURES.geojson,
        stroked: true,
        filled: true,
        extensions: [new ClipExtension()],
        clipBounds: [0, -30, 90, 30]
      },
      onAfterUpdate: ({subLayers}) => {
        for (const layer of subLayers) {
          const uniforms = layer.getModels()[0].getUniforms();
          t.is(uniforms.clipBounds[0], 256, 'has clipBounds uniform');
        }
      }
    }
  ];

  testLayer({Layer: GeoJsonLayer, testCases, onError: t.notOk});

  t.end();
});
