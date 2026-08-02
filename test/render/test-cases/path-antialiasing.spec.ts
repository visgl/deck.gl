// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe} from 'vitest';
import {runRenderTestSuite} from '../render-test-suite';
import type {TestCase} from '../deck-test-utils';

import {OrthographicView} from '@deck.gl/core';
import {PathLayer} from '@deck.gl/layers';

// This suite runs on a device created WITHOUT multisampling, matching how MapLibre and Mapbox
// create their WebGL context. On the default render-test device MSAA smooths the strokes whether
// or not `antialiasing` is set, and a golden captured there passes even with the feature disabled.
//
// `includeAA: true` is essential. pixelmatch detects antialiased pixels and excludes them from
// the mismatch count by default, and this prop changes nothing else - without it the diff is
// blind to the feature and the test passes even when it is disabled entirely.
//
// The scene is deliberately dense with thin shallow diagonals: the prop only changes edge pixels,
// so the edges have to be a large enough fraction of the frame for the image diff to register.
// Shallow diagonals are also the worst case for aliasing.

const ROWS = 26;
const SPACING = 16;

function diagonals(xOffset: number) {
  return Array.from({length: ROWS}, (_, i) => ({
    path: [
      [xOffset - 180, -200 + i * SPACING],
      [xOffset + 180, -200 + i * SPACING + 11]
    ]
  }));
}

const testCases: TestCase[] = [
  {
    name: 'path-antialiasing',
    views: new OrthographicView(),
    viewState: {target: [0, 0, 0], zoom: 0},
    layers: [
      new PathLayer({
        id: 'path-antialiasing-off',
        data: diagonals(-190),
        getPath: d => d.path,
        getColor: [20, 20, 20],
        getWidth: 2,
        widthUnits: 'pixels',
        antialiasing: false
      }),
      new PathLayer({
        id: 'path-antialiasing-on',
        data: diagonals(190),
        getPath: d => d.path,
        getColor: [20, 20, 20],
        getWidth: 2,
        widthUnits: 'pixels',
        antialiasing: true
      })
    ],
    imageDiffOptions: {threshold: 0.998, includeAA: true},
    goldenImage: './test/render/golden-images/path-antialiasing.png'
  }
];

describe.each(['webgl'] as const)('%s', deviceType => {
  runRenderTestSuite(testCases as TestCase[], deviceType, {webgl: {antialias: false}});
});
