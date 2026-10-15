// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  PostProcessEffect,
  LightingEffect,
  AmbientLight,
  DirectionalLight,
  _GlobeView as GlobeView
} from '@deck.gl/core';
import {zoomBlur, vignette} from '@luma.gl/effects';
import {hexagons, points} from 'deck.gl-test/data';

import {ScatterplotLayer, SolidPolygonLayer, ColumnLayer} from '@deck.gl/layers';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {MaskExtension} from '@deck.gl/extensions';

import {CubeGeometry} from '@luma.gl/engine';
import {polygons} from 'deck.gl-test/data';
import {describe} from 'vitest';
import {runRenderTestSuite} from '../render-test-suite';
import {expandViewMatrix} from '../view-presets';
import type {TestCase} from '../deck-test-utils';

const cube = new CubeGeometry();

const MASK_POLYGON = [
  [-122.48, 37.75],
  [-122.43, 37.73],
  [-122.4, 37.76],
  [-122.41, 37.78],
  [-122.45, 37.79],
  [-122.48, 37.75]
];

// Whole-globe mask case: a lng/lat quad over North America masking a 10-degree point grid
const WORLD_MASK_POLYGON = [
  [-130, 25],
  [-60, 25],
  [-60, 55],
  [-130, 55],
  [-130, 25]
];

const WORLD_GRID: number[][] = [];
for (let lng = -180; lng < 180; lng += 10) {
  for (let lat = -80; lat <= 80; lat += 10) {
    WORLD_GRID.push([lng, lat]);
  }
}

const testCases = [
  {
    name: 'shadow-effect',
    effects: [
      new LightingEffect({
        ambientLight: new AmbientLight({
          color: [255, 255, 255],
          intensity: 1.0
        }),
        dirLight: new DirectionalLight({
          color: [255, 255, 255],
          intensity: 1.0,
          direction: [-10, 2, -15],
          _shadow: true
        })
      })
    ],
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 30,
      bearing: 0,
      orthographic: true
    },
    layers: [
      new ColumnLayer({
        id: 'column-layer',
        data: hexagons,
        radius: 250,
        angle: Math.PI / 2,
        coverage: 1,
        extruded: true,
        pickable: true,
        getPosition: h => h.centroid,
        getFillColor: h => [48, 128, h.value * 255, 255],
        getElevation: h => h.value * 5000
      }),
      new SimpleMeshLayer({
        id: 'mesh-layer',
        data: points.slice(0, 50),
        mesh: cube,
        sizeScale: 150,
        shadowEnabled: false,
        getPosition: d => d.COORDINATES,
        getColor: [200, 200, 200],
        getTranslation: d => [0, 0, d.RACKS * 500],
        getOrientation: d => [45, 0, d.SPACES * 10]
      })
    ],
    goldenImage: './test/render/golden-images/shadow-effect.png'
  },
  // -> mask-effect, mask-effect-globe, mask-effect-inverted, mask-effect-inverted-globe
  ...[true, false].flatMap(maskInverted =>
    expandViewMatrix(
      {
        name: `mask-effect${maskInverted ? '-inverted' : ''}`,
        layers: [
          new SolidPolygonLayer({
            id: 'mask-layer',
            operation: 'mask',
            data: [{polygon: MASK_POLYGON}],
            getFillColor: [255, 255, 255]
          }),
          new SolidPolygonLayer({
            id: 'polygon',
            data: polygons,
            getPolygon: f => f,
            getFillColor: [200, 0, 0]
          }),
          new SolidPolygonLayer({
            id: 'polygon-masked',
            maskId: 'mask-layer',
            maskInverted,
            extensions: [new MaskExtension()],
            data: polygons,
            getPolygon: f => f,
            getFillColor: [0, 200, 0]
          }),
          new ScatterplotLayer({
            id: 'points',
            maskId: 'mask-layer',
            maskInverted,
            extensions: [new MaskExtension()],
            data: points,
            getPosition: d => d.COORDINATES,
            getFillColor: d => [0, 0, 200],
            getRadius: d => d.SPACES,
            radiusScale: 30,
            radiusMinPixels: 1,
            radiusMaxPixels: 30
          })
        ],
        imageDiffOptions: {
          threshold: 0.985
        }
      },
      ['map', 'globe']
    )
  ),
  {
    // Most of the globe is visible: the mask must still only hide points inside the quad
    name: 'mask-effect-globe-world',
    views: new GlobeView(),
    viewState: {longitude: -100, latitude: 40, zoom: 0.5},
    layers: [
      new SolidPolygonLayer({
        id: 'world-mask-layer',
        operation: 'mask',
        data: [{polygon: WORLD_MASK_POLYGON}],
        getFillColor: [255, 255, 255]
      }),
      new SolidPolygonLayer({
        id: 'world-mask-outline',
        data: [{polygon: WORLD_MASK_POLYGON}],
        getFillColor: [200, 200, 200, 80]
      }),
      new ScatterplotLayer({
        id: 'world-grid',
        data: WORLD_GRID,
        getPosition: d => d,
        getFillColor: [200, 0, 0],
        getRadius: 2,
        radiusUnits: 'pixels'
      }),
      new ScatterplotLayer({
        id: 'world-grid-masked',
        maskId: 'world-mask-layer',
        extensions: [new MaskExtension()],
        data: WORLD_GRID,
        getPosition: d => d,
        getFillColor: [0, 0, 200],
        getRadius: 6,
        radiusUnits: 'pixels'
      })
    ],
    imageDiffOptions: {
      threshold: 0.985
    },
    goldenImage: './test/render/golden-images/mask-effect-globe-world.png'
  },

  {
    name: 'post-process-effects',
    effects: [new PostProcessEffect(zoomBlur, {strength: 0.6}), new PostProcessEffect(vignette)],
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ScatterplotLayer({
        id: 'post-process-effects',
        data: points,
        getPosition: d => d.COORDINATES,
        getFillColor: d => [255, 128, 0],
        getRadius: d => d.SPACES,
        pickable: true,
        radiusScale: 30,
        radiusMinPixels: 1,
        radiusMaxPixels: 30
      })
    ],
    imageDiffOptions: {
      threshold: 0.985
    },
    goldenImage: './test/render/golden-images/post-process-effects.png'
  }
];

describe.each([
  'webgl'
  // 'webgpu'
] as const)('%s', deviceType => {
  runRenderTestSuite(testCases as TestCase[], deviceType);
});
