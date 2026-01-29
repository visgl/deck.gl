// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {BrushingExtension} from '@deck.gl/extensions';
import {ScatterplotLayer} from '@deck.gl/layers';
import {getLayerUniforms, testLayer} from '@deck.gl/test-utils';

test('BrushingExtension', () => {
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
        expect(uniforms.radius, 'has correct uniforms').toBeTruthy();
        expect(uniforms.enabled, 'has correct uniforms').toBe(false);
        expect(uniforms.target, 'has correct uniforms').toBe(0);
        expect(uniforms.mousePos[0], 'has correct uniforms').toBe(0);
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
        expect(uniforms.radius, 'has correct uniforms').toBe(5e6);
        expect(uniforms.enabled, 'has correct uniforms').toBe(true);
        expect(uniforms.target, 'has correct uniforms').toBe(2);
        expect(uniforms.mousePos[0], 'has correct uniforms').not.toBe(0);
      }
    }
  ];

  testLayer({Layer: ScatterplotLayer, testCases, onError: err => expect(err).toBeFalsy()});
});
