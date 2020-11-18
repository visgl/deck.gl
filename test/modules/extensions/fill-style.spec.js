import test from 'tape-catch';
import {FillStyleExtension} from '@deck.gl/extensions';
import {PolygonLayer} from '@deck.gl/layers';
import {testLayer} from '@deck.gl/test-utils';

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
        t.notOk(layer.state.patternMapping, 'should not be enabled in composite layer');

        const strokeLayer = subLayers.find(l => l.id.includes('stroke'));
        const fillLayer = subLayers.find(l => l.id.includes('fill'));

        let uniforms = fillLayer.getModels()[0].getUniforms();
        t.ok(uniforms.fill_patternMask, 'has fill_patternMask uniform');
        t.deepEqual(
          fillLayer.getAttributeManager().getAttributes().fillPatternScales.value,
          [2],
          'fillPatternScales attribute is populated'
        );
        t.deepEqual(
          fillLayer
            .getAttributeManager()
            .getAttributes()
            .fillPatternFrames.value.slice(0, 4),
          [0, 0, 1, 1],
          'fillPatternFrames attribute is populated'
        );

        uniforms = strokeLayer.getModels()[0].getUniforms();
        t.notOk(strokeLayer.state.patternMapping, 'should not be enabled in PathLayer');
        t.notOk('fill_patternMask' in uniforms, 'should not be enabled in PathLayer');
      }
    }
  ];

  testLayer({Layer: PolygonLayer, testCases, onError: t.notOk});

  t.end();
});
