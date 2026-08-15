// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe} from 'vitest';
import {runRenderTestSuite} from '../render-test-suite';
import type {TestCase} from '../deck-test-utils';

/* eslint-disable callback-return */
import {OrthographicView} from '@deck.gl/core';
import {LineLayer} from '@deck.gl/layers';
import {routes} from 'deck.gl-test/data';

// Thin shallow diagonals make shader-computed coverage visible in the golden. The case runs only
// in the isolated no-MSAA suite below; with MSAA enabled the browser smooths both variants.
const ANTIALIASING_LINES = Array.from({length: 38}, (_, index) => ({
  sourcePosition: [-170, -210 + index * 11],
  targetPosition: [170, -204 + index * 11]
}));

function createAntialiasingVariant(antialiasing: boolean): LineLayer {
  const xOffset = antialiasing ? 200 : -200;
  return new LineLayer({
    id: `line-antialiasing-${antialiasing ? 'on' : 'off'}`,
    data: ANTIALIASING_LINES.map(({sourcePosition, targetPosition}) => ({
      sourcePosition: [sourcePosition[0] + xOffset, sourcePosition[1]],
      targetPosition: [targetPosition[0] + xOffset, targetPosition[1]]
    })),
    getSourcePosition: data => data.sourcePosition,
    getTargetPosition: data => data.targetPosition,
    getColor: (_, {index}) => (index % 2 ? [20, 20, 20] : [0, 90, 200]),
    getWidth: 2,
    widthUnits: 'pixels',
    antialiasing
  });
}

const antialiasingTestCase: TestCase = {
  name: 'line-antialiasing',
  skip: ['msaa', 'webgpu'],
  views: new OrthographicView(),
  viewState: {target: [0, 0, 0], zoom: 0},
  layers: [createAntialiasingVariant(false), createAntialiasingVariant(true)],
  imageDiffOptions: {threshold: 0.998, includeAA: true},
  goldenImage: './test/render/golden-images/line-antialiasing.png'
};

const testCases: TestCase[] = [
  {
    name: 'line-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new LineLayer({
        id: 'line-lnglat',
        data: routes,
        opacity: 0.8,
        getWidth: 0,
        widthMinPixels: 2,
        getSourcePosition: d => d.START,
        getTargetPosition: d => d.END,
        getColor: d => (d.SERVICE === 'WEEKDAY' ? [255, 64, 0] : [255, 200, 0]),
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/line-lnglat.png'
  },
  antialiasingTestCase
];

describe.each(['webgl', 'webgpu'] as const)('%s', deviceType => {
  runRenderTestSuite(testCases, deviceType);
});

describe('webgl-no-msaa', () => {
  runRenderTestSuite([antialiasingTestCase], 'webgl', {
    deviceMode: 'isolated',
    webgl: {antialias: false}
  });
});
