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

const cube = new CubeGeometry();

// Hack in GLSL shader for vignette
// TODO: remove once https://github.com/visgl/luma.gl/pull/2403 released
vignette.source = vignette.fs;
vignette.fs = /* glsl */ `\
uniform vignetteUniforms {
  float radius;
  float amount;
} vignette;

vec4 vignette_filterColor_ext(vec4 color, vec2 texSize, vec2 texCoord) {
  float dist = distance(texCoord, vec2(0.5, 0.5));
  float ratio = smoothstep(0.8, vignette.radius * 0.799, dist * (vignette.amount + vignette.radius));
  return color.rgba * ratio + (1.0 - ratio)*vec4(0.0, 0.0, 0.0, 1.0);
}
`;

const MASK_POLYGON = [
  [-122.48, 37.75],
  [-122.43, 37.73],
  [-122.4, 37.76],
  [-122.41, 37.78],
  [-122.45, 37.79],
  [-122.48, 37.75]
];

export default [
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
