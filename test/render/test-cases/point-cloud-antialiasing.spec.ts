// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe} from 'vitest';
import {COORDINATE_SYSTEM, OrthographicView} from '@deck.gl/core';
import {PointCloudLayer} from '@deck.gl/layers';
import {runRenderTestSuite} from '../render-test-suite';
import type {TestCase} from '../deck-test-utils';

// Render without MSAA and include antialiased pixels in the diff. Both settings are required for
// the golden to distinguish shader coverage from the browser's default multisampling.
const POINTS = Array.from({length: 13 * 11}, (_, index) => ({
  position: [-156 + (index % 13) * 26.125, -190 + Math.floor(index / 13) * 38.25, 0]
}));

function variant(antialiasing: boolean): PointCloudLayer {
  const xOffset = antialiasing ? 200 : -200;
  return new PointCloudLayer({
    id: `point-cloud-antialiasing-${antialiasing ? 'on' : 'off'}`,
    data: POINTS.map(({position}) => ({position: [position[0] + xOffset, position[1], 0]})),
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    getPosition: data => data.position,
    getColor: (_, {index}) => (index % 2 ? [20, 20, 20] : [0, 90, 200]),
    pointSize: 7,
    antialiasing
  });
}

const testCases: TestCase[] = [
  {
    name: 'point-cloud-antialiasing',
    views: new OrthographicView(),
    viewState: {target: [0, 0, 0], zoom: 0},
    layers: [variant(false), variant(true)],
    imageDiffOptions: {threshold: 0.998, includeAA: true},
    goldenImage: './test/render/golden-images/point-cloud-antialiasing.png'
  }
];

describe('webgl', () => {
  runRenderTestSuite(testCases, 'webgl', {
    deviceMode: 'isolated',
    webgl: {antialias: false}
  });
});
