// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {BrushingExtension} from '@deck.gl/extensions';
import {ScatterplotLayer} from '@deck.gl/layers';
import {getLayerUniforms, testLayer} from '@deck.gl/test-utils';

test('BrushingExtension', t => {
  const testCases = [
    {
      props: {
        data: [
          {position: [-122.453, 37.782], timestamp: 120, entry: 13567, exit: 4802},
          {position: [-122.454, 37.781], timestamp: 140, entry: 14475, exit: 5493}
        ],
        getPosition: d => d.position,
        getBrushingTarget: d => d.position,

        extensions: [new BrushingExtension()]
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        t.ok(uniforms.radius, 'has correct uniforms');
        t.is(uniforms.enabled, false, 'has correct uniforms');
        t.is(uniforms.target, 0, 'has correct uniforms');
        t.is(uniforms.mousePos[0], 0, 'has correct uniforms');
      }
    },
    {
      updateProps: {
        brushingEnabled: true,
        brushingTarget: 'custom',
        brushingRadius: 5e6
      },
      onBeforeUpdate: ({layer}) => {
        // Simulate user interaction
        layer.context.mousePosition = {x: 1, y: 1};
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        t.is(uniforms.radius, 5e6, 'has correct uniforms');
        t.is(uniforms.enabled, true, 'has correct uniforms');
        t.is(uniforms.target, 2, 'has correct uniforms');
        t.not(uniforms.mousePos[0], 0, 'has correct uniforms');
      }
    }
  ];

  testLayer({Layer: ScatterplotLayer, testCases, onError: t.notOk});

  t.end();
});
