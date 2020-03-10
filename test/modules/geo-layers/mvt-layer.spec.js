import test from 'tape-catch';
import {generateLayerTests, testLayer} from '@deck.gl/test-utils';
import {MVTLayer} from '@deck.gl/geo-layers';
import ClipExtension from '@deck.gl/geo-layers/mvt-layer/clip-extension';
import {GeoJsonLayer} from '@deck.gl/layers';

import * as FIXTURES from 'deck.gl-test/data';

test('MVTLayer', t => {
  const testCases = generateLayerTests({
    Layer: MVTLayer,
    assert: t.ok,
    sampleProps: {
      data: 'https://a.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png'
    },
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });
  testLayer({Layer: MVTLayer, testCases, onError: t.notOk});
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
          t.ok(uniforms.clip_bounds && uniforms.clip_bounds[0] === 256, 'has clip_bounds uniform');
        }
      }
    }
  ];

  testLayer({Layer: GeoJsonLayer, testCases, onError: t.notOk});

  t.end();
});
