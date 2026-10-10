// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {ScatterplotLayer} from '@deck.gl/layers';
import {BrushingExtension} from '@deck.gl/extensions';
import {points} from 'deck.gl-test/data';
import {describe} from 'vitest';
import {runRenderTestSuite} from '../render-test-suite';
import {expandViewMatrix} from '../view-presets';
import {WIDTH, HEIGHT} from '../constants';
import type {TestCase} from '../deck-test-utils';

// Brushing radius in meters; a ~3 km circle around the canvas centre at zoom 11.5
const BRUSHING_RADIUS = 3000;

/**
 * Places the pointer at the canvas centre. `context.mousePosition` is what BrushingExtension
 * reads in draw(); Deck only overwrites it on real pointer events, so the injected value
 * persists for the whole test.
 */
const setMousePosition: TestCase['onBeforeRender'] = ({deck}) => {
  // @ts-expect-error accessing protected layerManager
  deck.layerManager.context.mousePosition = {x: WIDTH / 2, y: HEIGHT / 2};
  // @ts-expect-error accessing protected layerManager
  deck.layerManager.setNeedsRedraw('brushing-test');
};

const getPointLayer = (id: string, props = {}) =>
  new ScatterplotLayer({
    id,
    data: points,
    getPosition: d => d.COORDINATES,
    getFillColor: [0, 160, 0],
    getRadius: 6,
    radiusUnits: 'pixels',
    brushingEnabled: true,
    brushingRadius: BRUSHING_RADIUS,
    extensions: [new BrushingExtension()],
    ...props
  });

const testCases: TestCase[] = [
  {
    name: 'brushing-source',
    layers: [getPointLayer('brushing-source')]
  },
  {
    name: 'brushing-disabled',
    layers: [getPointLayer('brushing-disabled', {brushingEnabled: false})]
  }
].flatMap(({name, layers}) =>
  expandViewMatrix(
    {
      name,
      layers,
      onBeforeRender: setMousePosition,
      overrides: {
        globe: {
          skip: ['webgpu'],
          imageDiffOptions: {threshold: 0.985}
        }
      }
    },
    ['map', 'globe']
  )
);

describe.each([
  'webgl'
  // 'webgpu'
] as const)('%s', deviceType => {
  runRenderTestSuite(testCases, deviceType);
});
