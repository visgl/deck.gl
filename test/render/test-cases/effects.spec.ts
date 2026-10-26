// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {PostProcessEffect, LightingEffect, AmbientLight, DirectionalLight} from '@deck.gl/core';
import {zoomBlur, vignette} from '@luma.gl/effects';
import {hexagons, points} from 'deck.gl-test/data';

import {ScatterplotLayer, SolidPolygonLayer, ColumnLayer} from '@deck.gl/layers';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {MaskExtension} from '@deck.gl/extensions';

import {CubeGeometry} from '@luma.gl/engine';
import {polygons} from 'deck.gl-test/data';
import {describe} from 'vitest';
import {runRenderTestSuite} from '../render-test-suite';
import type {TestCase} from '../deck-test-utils';

const cube = new CubeGeometry();

const groundPlane = {
  attributes: {
    positions: {
      size: 3,
      value: new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0])
    },
    normals: {
      size: 3,
      value: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1])
    }
  }
};

const MASK_POLYGON = [
  [-122.48, 37.75],
  [-122.43, 37.73],
  [-122.4, 37.76],
  [-122.41, 37.78],
  [-122.45, 37.79],
  [-122.48, 37.75]
];

// Coplanar ground tiles, one layer each. Tiles with a higher layer index must not shadow themselves.
const SHADOW_TILE_SIZE = 0.0008;
const shadowTileLayers = Array.from({length: 8}, (_, i) => {
  const x = -122.4 + ((i % 4) - 1.5) * SHADOW_TILE_SIZE;
  const y = 37.74 + (0.5 - Math.floor(i / 4)) * SHADOW_TILE_SIZE;
  const r = SHADOW_TILE_SIZE / 2;
  return new SolidPolygonLayer({
    id: `shadow-tile-${i}`,
    data: [
      [
        [x - r, y - r],
        [x + r, y - r],
        [x + r, y + r],
        [x - r, y + r]
      ]
    ],
    getPolygon: f => f,
    getFillColor: [200, 200, 200]
  });
});

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
  {
    // A lit SimpleMeshLayer must not shadow itself: the ground receives only the box's shadow
    name: 'shadow-effect-simple-mesh',
    effects: [
      new LightingEffect({
        ambientLight: new AmbientLight({
          color: [255, 255, 255],
          intensity: 1.0
        }),
        dirLight: new DirectionalLight({
          color: [255, 255, 255],
          intensity: 1.0,
          direction: [1, -0.5, -1],
          _shadow: true
        })
      })
    ],
    viewState: {
      latitude: 37.74,
      longitude: -122.4,
      zoom: 16,
      pitch: 45,
      bearing: 20
    },
    layers: [
      new SimpleMeshLayer({
        id: 'ground',
        data: [0],
        mesh: groundPlane,
        sizeScale: 300,
        coordinateSystem: 'meter-offsets',
        coordinateOrigin: [-122.4, 37.74, 0],
        getPosition: d => [0, 0, 0],
        getColor: [200, 200, 200]
      }),
      new SimpleMeshLayer({
        id: 'box',
        data: [0],
        mesh: cube,
        sizeScale: 30,
        coordinateSystem: 'meter-offsets',
        coordinateOrigin: [-122.4, 37.74, 0],
        getPosition: d => [0, 0, 80],
        getColor: [230, 80, 60]
      })
    ],
    goldenImage: './test/render/golden-images/shadow-effect-simple-mesh.png'
  },
  {
    name: 'shadow-effect-layer-index',
    effects: [
      new LightingEffect({
        ambientLight: new AmbientLight({
          color: [255, 255, 255],
          intensity: 1.0
        }),
        dirLight: new DirectionalLight({
          color: [255, 255, 255],
          intensity: 1.0,
          direction: [1, -0.5, -1],
          _shadow: true
        })
      })
    ],
    viewState: {
      latitude: 37.74,
      longitude: -122.4,
      zoom: 17,
      pitch: 45,
      bearing: 0
    },
    layers: [
      ...shadowTileLayers,
      new SolidPolygonLayer({
        id: 'shadow-box',
        data: [
          [
            [-122.4003, 37.7397],
            [-122.3997, 37.7397],
            [-122.3997, 37.7403],
            [-122.4003, 37.7403]
          ]
        ],
        extruded: true,
        getPolygon: f => f,
        getElevation: 40,
        getFillColor: [230, 80, 60]
      })
    ],
    goldenImage: './test/render/golden-images/shadow-effect-layer-index.png'
  },
  {
    // The top of the viewport is above the horizon
    name: 'shadow-effect-high-pitch',
    effects: [
      new LightingEffect({
        ambientLight: new AmbientLight({
          color: [255, 255, 255],
          intensity: 1.0
        }),
        dirLight: new DirectionalLight({
          color: [255, 255, 255],
          intensity: 1.0,
          direction: [1, -1, -0.6],
          _shadow: true
        })
      })
    ],
    viewState: {
      latitude: 37.74,
      longitude: -122.4,
      zoom: 16,
      pitch: 80,
      bearing: 0
    },
    layers: [
      new SolidPolygonLayer({
        id: 'ground',
        data: [
          [
            [-122.434, 37.713],
            [-122.366, 37.713],
            [-122.366, 37.767],
            [-122.434, 37.767]
          ]
        ],
        getPolygon: f => f,
        getFillColor: [200, 200, 200]
      }),
      new SolidPolygonLayer({
        id: 'boxes',
        data: Array.from({length: 9}, (_, i) => {
          const x = -122.4032 + i * 0.0008;
          return [
            [x - 0.0002, 37.7398],
            [x + 0.0002, 37.7398],
            [x + 0.0002, 37.7402],
            [x - 0.0002, 37.7402]
          ];
        }),
        extruded: true,
        getPolygon: f => f,
        getElevation: 60,
        getFillColor: [230, 80, 60]
      })
    ],
    goldenImage: './test/render/golden-images/shadow-effect-high-pitch.png'
  },
  ...[true, false].map(maskInverted => ({
    name: `mask-effect${maskInverted ? '-inverted' : ''}`,
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
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
    },
    goldenImage: `./test/render/golden-images/mask-effect${maskInverted ? '-inverted' : ''}.png`
  })),

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
