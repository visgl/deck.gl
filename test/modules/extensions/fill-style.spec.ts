// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {FillStyleExtension} from '@deck.gl/extensions';
import {PolygonLayer} from '@deck.gl/layers';
import {getLayerUniforms, testLayer} from '@deck.gl/test-utils';

import * as FIXTURES from 'deck.gl-test/data';

const FILL_PATTERN_ATLAS = new Uint8Array(4);
const FILL_PATTERN_MAPPING = {
  pattern: {x: 0, y: 0, width: 1, height: 1}
};

test('FillStyleExtension#PolygonLayer', () => {
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
        expect(layer.state.emptyTexture, 'should not be enabled in composite layer').toBeFalsy();

        const strokeLayer = subLayers.find(l => l.id.includes('stroke'));
        const fillLayer = subLayers.find(l => l.id.includes('fill'));

        expect(fillLayer.state.emptyTexture, 'should be enabled in composite layer').toBeTruthy();
        let uniforms = getLayerUniforms(fillLayer);
        expect(uniforms.patternMask, 'has patternMask uniform').toBeTruthy();
        expect(
          fillLayer.getAttributeManager().getAttributes().fillPatternScales.value,
          'fillPatternScales attribute is populated'
        ).toEqual([2]);
        expect(
          fillLayer.getAttributeManager().getAttributes().fillPatternFrames.value.slice(0, 4),
          'fillPatternFrames attribute is populated'
        ).toEqual([0, 0, 1, 1]);

        uniforms = getLayerUniforms(strokeLayer);
        expect(strokeLayer.state.emptyTexture, 'should not be enabled in PathLayer').toBeFalsy();
        expect('patternMask' in uniforms, 'should not be enabled in PathLayer').toBeFalsy();
      }
    },
    {
      title: `Finalizing a sublayer should not affect the parent layer's loaded props`,
      updateProps: {
        data: []
      },
      onAfterUpdate: ({layer}) => {
        expect(
          layer.props.fillPatternAtlas.handle,
          'fillPatternAtlas texture is not deleted'
        ).toBeTruthy();
      }
    }
  ];

  testLayer({Layer: PolygonLayer, testCases, onError: err => expect(err).toBeFalsy()});
});
