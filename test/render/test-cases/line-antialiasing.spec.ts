// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe} from 'vitest';
import {OrthographicView} from '@deck.gl/core';
import {LineLayer} from '@deck.gl/layers';
import {runRenderTestSuite} from '../render-test-suite';
import type {TestCase} from '../deck-test-utils';

// Render without MSAA and include antialiased pixels in the diff. Both settings are required for
// the golden to distinguish shader coverage from the browser's default multisampling.
const LINES = Array.from({length: 38}, (_, index) => ({
  sourcePosition: [-170, -210 + index * 11],
  targetPosition: [170, -204 + index * 11]
}));

function variant(antialiasing: boolean): LineLayer {
  const xOffset = antialiasing ? 200 : -200;
  return new LineLayer({
    id: `line-antialiasing-${antialiasing ? 'on' : 'off'}`,
    data: LINES.map(({sourcePosition, targetPosition}) => ({
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

const testCases: TestCase[] = [
  {
    name: 'line-antialiasing',
    views: new OrthographicView(),
    viewState: {target: [0, 0, 0], zoom: 0},
    layers: [variant(false), variant(true)],
    imageDiffOptions: {threshold: 0.998, includeAA: true},
    goldenImage: './test/render/golden-images/line-antialiasing.png'
  }
];

describe('webgl', () => {
  runRenderTestSuite(testCases, 'webgl', {
    deviceMode: 'isolated',
    webgl: {antialias: false}
  });
});
