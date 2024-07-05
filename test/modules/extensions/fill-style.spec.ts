import test from 'tape-promise/tape';
import {FillStyleExtension} from '@deck.gl/extensions';
import {PolygonLayer} from '@deck.gl/layers';
import {getLayerUniforms, testLayer} from '@deck.gl/test-utils';

import * as FIXTURES from 'deck.gl-test/data';

const FILL_PATTERN_ATLAS = new Uint8Array(4);
const FILL_PATTERN_MAPPING = {
  pattern: {x: 0, y: 0, width: 1, height: 1}
};

test('FillStyleExtension#PolygonLayer', t => {
  const testCases = [
    {
      props: {
        id: 'fill-style-extension-test',
        data: FIXTURES.polygons,
        getPolygon: d => d,

        fillPatternAtlas: FILL_PATTERN_ATLAS,
        fillPatternMapping: FILL_PATTERN_MAPPING,
        getFillPattern: f => 'pattern',
        getFillPatternOffset: [0.5, 0.5],
        getFillPatternScale: 2,

        extensions: [new FillStyleExtension({pattern: true})]
      },
      onAfterUpdate: ({layer, subLayers}) => {
        t.notOk(layer.state.emptyTexture, 'should not be enabled in composite layer');

        const strokeLayer = subLayers.find(l => l.id.includes('stroke'));
        const fillLayer = subLayers.find(l => l.id.includes('fill'));

        t.ok(fillLayer.state.emptyTexture, 'should be enabled in composite layer');
        let uniforms = getLayerUniforms(fillLayer);
        t.ok(uniforms.patternMask, 'has patternMask uniform');
        t.deepEqual(
          fillLayer.getAttributeManager().getAttributes().fillPatternScales.value,
          [2],
          'fillPatternScales attribute is populated'
        );
        t.deepEqual(
          fillLayer.getAttributeManager().getAttributes().fillPatternFrames.value.slice(0, 4),
          [0, 0, 1, 1],
          'fillPatternFrames attribute is populated'
        );

        uniforms = getLayerUniforms(strokeLayer);
        t.notOk(strokeLayer.state.emptyTexture, 'should not be enabled in PathLayer');
        t.notOk('patternMask' in uniforms, 'should not be enabled in PathLayer');
      }
    },
    {
      title: `Finalizing a sublayer should not affect the parent layer's loaded props`,
      updateProps: {
        data: []
      },
      onAfterUpdate: ({layer}) => {
        t.ok(layer.props.fillPatternAtlas.handle, 'fillPatternAtlas texture is not deleted');
      }
    }
  ];

  testLayer({Layer: PolygonLayer, testCases, onError: t.notOk});

  t.end();
});
