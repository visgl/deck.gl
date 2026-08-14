// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe} from 'vitest';
import {COORDINATE_SYSTEM, OrthographicView} from '@deck.gl/core';
import {ArcLayer} from '@deck.gl/layers';
import {runRenderTestSuite} from '../render-test-suite';
import type {TestCase} from '../deck-test-utils';

// Render without MSAA and include antialiased pixels in the diff. Both settings are required for
// the golden to distinguish shader coverage from the browser's default multisampling.
const ARCS = Array.from({length: 18}, (_, index) => ({
  sourcePosition: [-170, -210 + index * 24, 0],
  targetPosition: [170, -204 + index * 24, 0]
}));

function variant(antialiasing: boolean): ArcLayer {
  const xOffset = antialiasing ? 200 : -200;
  return new ArcLayer({
    id: `arc-antialiasing-${antialiasing ? 'on' : 'off'}`,
    data: ARCS.map(({sourcePosition, targetPosition}) => ({
      sourcePosition: [sourcePosition[0] + xOffset, sourcePosition[1], 0],
      targetPosition: [targetPosition[0] + xOffset, targetPosition[1], 0]
    })),
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    getSourcePosition: data => data.sourcePosition,
    getTargetPosition: data => data.targetPosition,
    getSourceColor: [200, 60, 0],
    getTargetColor: [0, 90, 200],
    getWidth: 2,
    getHeight: 0.2,
    getTilt: 90,
    widthUnits: 'pixels',
    numSegments: 50,
    antialiasing
  });
}

const testCases: TestCase[] = [
  {
    name: 'arc-antialiasing',
    views: new OrthographicView(),
    viewState: {target: [0, 0, 0], zoom: 0},
    layers: [variant(false), variant(true)],
    imageDiffOptions: {threshold: 0.998, includeAA: true},
    goldenImage: './test/render/golden-images/arc-antialiasing.png'
  }
];

describe('webgl', () => {
  runRenderTestSuite(testCases, 'webgl', {
    deviceMode: 'isolated',
    webgl: {antialias: false}
  });
});
