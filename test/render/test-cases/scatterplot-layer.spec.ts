// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe} from 'vitest';
import {runRenderTestSuite} from '../render-test-suite';
import type {TestCase} from '../deck-test-utils';

/* eslint-disable callback-return */
import {COORDINATE_SYSTEM, OrthographicView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

import {Fp64Extension, PathStyleExtension} from '@deck.gl/extensions';
import * as dataSamples from 'deck.gl-test/data';

// eslint-disable-next-line
const TISSOTS_INDICATRIX = (function () {
  const result = [];
  for (let lng = -180; lng <= 180; lng += 30) {
    for (let lat = -60; lat <= 60; lat += 30) {
      result.push([lng, lat]);
    }
  }
  return result;
})();

const testCases = [
  {
    name: 'scatterplot-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ScatterplotLayer({
        id: 'scatterplot-lnglat',
        data: dataSamples.points,
        getPosition: d => d.COORDINATES,
        getFillColor: d => [255, 128, 0],
        getRadius: d => d.SPACES,
        pickable: true,
        radiusScale: 30,
        radiusMinPixels: 1,
        radiusMaxPixels: 30
      })
    ],
    goldenImage: './test/render/golden-images/scatterplot-lnglat.png'
  },
  {
    name: 'scatterplot-lnglat-64',
    skip: ['webgpu'],
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ScatterplotLayer({
        id: 'scatterplot-lnglat',
        data: dataSamples.points,
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
        getPosition: d => d.COORDINATES,
        getFillColor: d => [255, 128, 0],
        getRadius: d => d.SPACES,
        pickable: true,
        radiusScale: 30,
        radiusMinPixels: 1,
        radiusMaxPixels: 30,
        extensions: [new Fp64Extension()]
      })
    ],
    goldenImage: './test/render/golden-images/scatterplot-lnglat.png'
  },
  {
    name: 'scatterplot-lnglat-billboard',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 45,
      bearing: 0
    },
    layers: [
      new ScatterplotLayer({
        id: 'scatterplot-lnglat-billboard',
        data: dataSamples.points,
        getPosition: d => d.COORDINATES,
        getFillColor: d => [255, 128, 0],
        getRadius: d => d.SPACES,
        billboard: true,
        antialiasing: false,
        radiusScale: 30,
        radiusMinPixels: 1,
        radiusMaxPixels: 30
      })
    ],
    goldenImage: './test/render/golden-images/scatterplot-lnglat-billboard.png'
  },
  {
    name: 'scatterplot-tissot',
    viewState: {
      latitude: 0,
      longitude: 0,
      zoom: 0,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ScatterplotLayer({
        id: 'scatterplot-tissot',
        data: TISSOTS_INDICATRIX,
        getPosition: d => d,
        getFillColor: [255, 0, 0, 200],
        getRadius: 1e6
      })
    ],
    goldenImage: './test/render/golden-images/scatterplot-tissot.png'
  },
  {
    name: 'scatterplot-smoothedge',
    viewState: {
      latitude: 47,
      longitude: -120,
      zoom: 6
    },
    useDevicePixels: 2,
    layers: [
      new ScatterplotLayer({
        id: 'background',
        data: [0],
        getFillColor: d => [0, 0, 0],
        getPosition: d => [-120, 47],
        getRadius: d => 1000,
        radiusUnits: 'pixels'
      }),
      ...[true, false].map(
        antialiasing =>
          new ScatterplotLayer({
            id: `circles-${antialiasing}`,
            data: Array(399)
              .fill()
              .map((x, i) => i),
            getFillColor: antialiasing ? [255, 250, 50] : [0, 0, 0],
            getPosition: d => [-124 + 0.4 * Math.floor(d / 19), 48.25 - 0.14 * (d % 19)],
            getRadius: d => 4 + 8 * (d % 2),
            antialiasing,
            parameters: {
              depthCompare: 'always',
              depthWriteEnabled: false
            },
            radiusUnits: 'pixels'
          })
      )
    ],
    goldenImage: './test/render/golden-images/scatterplot-smoothedge.png'
  },
  {
    name: 'scatterplot-dash',
    skip: ['webgpu'],
    viewState: {
      target: [0, 0, 0],
      zoom: 0
    },
    views: [new OrthographicView()],
    layers: [
      new ScatterplotLayer({
        id: 'scatterplot-dash',
        data: [
          // Filled + dashed, varying dash patterns
          {
            pos: [-200, -120],
            radius: 55,
            dash: [3, 2],
            fill: [255, 200, 0, 180],
            line: [0, 100, 200],
            filled: true
          },
          {
            pos: [0, -120],
            radius: 70,
            dash: [6, 2],
            fill: [100, 255, 100, 180],
            line: [0, 0, 0],
            filled: true
          },
          {
            pos: [200, -120],
            radius: 45,
            dash: [1, 1],
            fill: [255, 180, 180, 180],
            line: [150, 50, 50],
            filled: true
          },
          // Stroke-only, varying dash patterns
          {
            pos: [-200, 100],
            radius: 60,
            dash: [4, 3],
            fill: [0, 0, 0, 0],
            line: [200, 50, 100],
            filled: false
          },
          {
            pos: [0, 100],
            radius: 50,
            dash: [2, 4],
            fill: [0, 0, 0, 0],
            line: [0, 150, 0],
            filled: false
          },
          // Solid stroke for comparison (no dash)
          {
            pos: [200, 100],
            radius: 50,
            dash: [0, 0],
            fill: [220, 220, 255, 180],
            line: [100, 0, 100],
            filled: true
          }
        ],
        getPosition: d => d.pos,
        getRadius: d => d.radius,
        getFillColor: d => d.fill,
        getLineColor: d => d.line,
        getDashArray: d => d.dash,
        stroked: true,
        getFilled: d => d.filled,
        radiusUnits: 'pixels',
        lineWidthMinPixels: 4,
        extensions: [new PathStyleExtension({dash: true})]
      })
    ],
    goldenImage: './test/render/golden-images/scatterplot-dash.png'
  }
];

describe.each(['webgl', 'webgpu'] as const)('%s', deviceType => {
  runRenderTestSuite(testCases as TestCase[], deviceType);
});
