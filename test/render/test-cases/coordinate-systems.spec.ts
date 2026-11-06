// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe} from 'vitest';
import {runRenderTestSuite} from '../render-test-suite';
import type {TestCase} from '../deck-test-utils';

import {ColumnLayer} from '@deck.gl/layers';
import {lngLatToWorld} from '@math.gl/web-mercator';

const LONGITUDE = 10;
const LATITUDE = 61;
// Side by side, about 1.7 km apart, south of the view center so that the tops stay in view
const LNGLAT_POSITION: [number, number] = [LONGITUDE - 0.016, LATITUDE - 0.008];
const CARTESIAN_ORIGIN: [number, number, number] = [
  ...lngLatToWorld([LONGITUDE + 0.016, LATITUDE - 0.008]),
  0
];

const columnProps = {
  data: [{position: [0, 0, 0]}],
  radius: 400,
  diskResolution: 6,
  extruded: true,
  elevationScale: 1,
  getElevation: 1500
};

/**
 * A cartesian column next to a lnglat column of the same height. The lnglat column is the
 * reference: both must have equal height on either side of the zoom 12 switch to offset mode.
 */
function getCartesianHeightTestCase(name: string, zoom: number): TestCase {
  return {
    name,
    viewState: {
      longitude: LONGITUDE,
      latitude: LATITUDE,
      zoom,
      pitch: 60,
      bearing: 0
    },
    layers: [
      new ColumnLayer({
        ...columnProps,
        id: `${name}-lnglat`,
        getPosition: () => LNGLAT_POSITION,
        getFillColor: [240, 140, 40]
      }),
      new ColumnLayer({
        ...columnProps,
        id: `${name}-cartesian`,
        coordinateSystem: 'cartesian',
        coordinateOrigin: CARTESIAN_ORIGIN,
        getPosition: d => d.position,
        getFillColor: [40, 140, 240]
      })
    ],
    goldenImage: `./test/render/golden-images/${name}.png`
  };
}

const testCases: TestCase[] = [
  getCartesianHeightTestCase('cartesian-height-zoom-11.99', 11.99),
  getCartesianHeightTestCase('cartesian-height-zoom-12', 12)
];

describe.each(['webgl', 'webgpu'] as const)('%s', deviceType => {
  runRenderTestSuite(testCases, deviceType);
});
