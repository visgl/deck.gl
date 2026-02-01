// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {StrokeStyleExtension} from '@deck.gl/extensions';
import {ScatterplotLayer} from '@deck.gl/layers';
import {getLayerUniforms, testLayer} from '@deck.gl/test-utils';

import * as FIXTURES from 'deck.gl-test/data';

test('StrokeStyleExtension#ScatterplotLayer', t => {
  const testCases = [
    {
      props: {
        id: 'stroke-style-extension-test',
        data: FIXTURES.points,
        getPosition: d => d.COORDINATES,
        getRadius: d => d.SPACES || 1,
        stroked: true,
        filled: true,
        getDashArray: [0, 0],
        extensions: [new StrokeStyleExtension({dash: true})]
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        t.is(uniforms.dashGapPickable, false, 'has dashGapPickable uniform');
        const attributes = layer.getAttributeManager().getAttributes();
        t.ok(attributes.instanceDashArrays, 'instanceDashArrays attribute exists');
        t.deepEqual(
          attributes.instanceDashArrays.value.slice(0, 2),
          [0, 0],
          'instanceDashArrays attribute is populated'
        );
      }
    },
    {
      updateProps: {
        dashGapPickable: true,
        getDashArray: d => [3, 1],
        updateTriggers: {
          getDashArray: 1
        }
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        t.is(uniforms.dashGapPickable, true, 'dashGapPickable uniform is updated');
        const attributes = layer.getAttributeManager().getAttributes();
        t.deepEqual(
          attributes.instanceDashArrays.value.slice(0, 2),
          [3, 1],
          'instanceDashArrays attribute is updated'
        );
      }
    }
  ];

  testLayer({Layer: ScatterplotLayer, testCases, onError: t.notOk});

  t.end();
});

test('StrokeStyleExtension#disabled for non-scatterplot layers', t => {
  // Test that the extension doesn't activate for layers without proper structure
  const extension = new StrokeStyleExtension({dash: true});

  // Create a mock layer object
  const mockLayer = {
    constructor: {name: 'OtherLayer'},
    props: {someOtherProp: true}
  };

  t.is(extension.isEnabled(mockLayer as any), false, 'isEnabled returns false for non-scatterplot layers');

  t.end();
});
