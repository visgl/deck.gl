// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {_GlobeViewport as GlobeViewport} from '@deck.gl/core';
import {BrushingExtension} from '@deck.gl/extensions';
import {ScatterplotLayer} from '@deck.gl/layers';
import {getLayerUniforms, testLayer} from '@deck.gl/test-utils/vitest';

const globeViewport = new GlobeViewport({
  longitude: -122.42694203247012,
  latitude: 37.751537058389985,
  zoom: 11.5,
  width: 800,
  height: 450
});

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
    },
    {
      title: 'GlobeViewport',
      viewport: globeViewport,
      updateProps: {
        brushingTarget: 'source',
        brushingRadius: 3000
      },
      onBeforeUpdate: ({layer}) => {
        // Pointer at the canvas centre; GlobeViewport.unproject yields lng/lat via ray-sphere intersection
        layer.context.mousePosition = {x: 400, y: 225};
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        const [lng, lat] = globeViewport.unproject([400, 225]);
        expect(uniforms.enabled, 'enabled inside the globe viewport').toBe(true);
        expect(uniforms.radius, 'radius in meters').toBe(3000);
        expect(uniforms.mousePos[0], 'mousePos is lng').toBeCloseTo(lng, 5);
        expect(uniforms.mousePos[1], 'mousePos is lat').toBeCloseTo(lat, 5);
        expect(uniforms.mousePos[0], 'mousePos is near the view centre').toBeCloseTo(-122.427, 2);
        expect(uniforms.mousePos[1], 'mousePos is near the view centre').toBeCloseTo(37.752, 2);
      }
    }
  ];

  testLayer({Layer: ScatterplotLayer, testCases, onError: err => expect(err).toBeFalsy()});
});
