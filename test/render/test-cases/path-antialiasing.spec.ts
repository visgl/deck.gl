// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe} from 'vitest';
import {runRenderTestSuite} from '../render-test-suite';
import type {TestCase} from '../deck-test-utils';

import {OrthographicView} from '@deck.gl/core';
import {PathLayer} from '@deck.gl/layers';

// Runs on a device created without multisampling, matching how base maps create their context.
// On the default render-test device MSAA smooths the strokes either way and this test passes even
// with the feature removed. `includeAA: true` is equally load-bearing - pixelmatch drops
// antialiased pixels from the mismatch count by default, and this prop changes nothing else.
// See dev-docs/RFCs/v9.4/path-line-antialiasing-rfc.md

// Thin shallow diagonals: the worst case for aliasing, and the bulk of the edge pixels the image
// diff depends on. Axis-aligned edges land on pixel boundaries and never partially cover.
const DIAGONALS = Array.from({length: 20}, (_, i) => ({
  path: [
    [-170, -210 + i * 10],
    [170, -210 + i * 10 + 6]
  ]
}));

// Sharp direction changes, to cover joints and caps as well as straight runs
const ZIGZAG = [
  {
    path: [
      [-170, 20],
      [-60, 100],
      [50, 20],
      [170, 90]
    ]
  }
];

function column(xOffset: number, paths: {path: number[][]}[]) {
  return paths.map(d => ({path: d.path.map(([x, y]) => [x + xOffset, y])}));
}

/** Same scene twice, differing only in `antialiasing` - left column off, right column on. */
function variant(antialiasing: boolean) {
  const xOffset = antialiasing ? 200 : -200;
  const suffix = antialiasing ? 'on' : 'off';
  return [
    new PathLayer({
      id: `path-aa-diagonals-${suffix}`,
      data: column(xOffset, DIAGONALS),
      getPath: d => d.path,
      getColor: [20, 20, 20],
      getWidth: 2,
      widthUnits: 'pixels',
      antialiasing
    }),
    new PathLayer({
      id: `path-aa-rounded-${suffix}`,
      data: column(xOffset, ZIGZAG),
      getPath: d => d.path,
      getColor: [200, 60, 0],
      getWidth: 7,
      widthUnits: 'pixels',
      jointRounded: true,
      capRounded: true,
      antialiasing
    }),
    new PathLayer({
      id: `path-aa-miter-${suffix}`,
      data: column(xOffset, ZIGZAG).map(d => ({
        path: d.path.map(([x, y]) => [x, y + 110])
      })),
      getPath: d => d.path,
      getColor: [0, 90, 200],
      getWidth: 7,
      widthUnits: 'pixels',
      jointRounded: false,
      capRounded: false,
      antialiasing
    })
  ];
}

const testCases: TestCase[] = [
  {
    name: 'path-antialiasing',
    views: new OrthographicView(),
    viewState: {target: [0, 0, 0], zoom: 0},
    layers: [...variant(false), ...variant(true)],
    imageDiffOptions: {threshold: 0.998, includeAA: true},
    goldenImage: './test/render/golden-images/path-antialiasing.png'
  }
];

describe.each([
  'webgl'
  // 'webgpu'
] as const)('%s', deviceType => {
  runRenderTestSuite(testCases as TestCase[], deviceType, {
    deviceMode: 'isolated',
    webgl: {antialias: false}
  });
});
