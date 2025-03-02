// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {QuadkeyLayer} from '@deck.gl/geo-layers';
import {quadkeys} from 'deck.gl-test/data';

export default [
  {
    name: 'quadkey-layer',
    viewState: {
      latitude: 37.75,
      longitude: -122.45,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new QuadkeyLayer({
        data: quadkeys,
        opacity: 0.8,
        filled: true,
        stroked: false,
        getQuadkey: f => f.quadkey,
        getFillColor: f => [f.value * 255, (1 - f.value) * 255, (1 - f.value) * 128],
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/quadkey-layer.png'
  },
  {
    name: 'quadkey-layer-extruded',
    viewState: {
      latitude: 37.79,
      longitude: -122.45,
      zoom: 10.5,
      pitch: 50,
      bearing: 10
    },
    layers: [
      new QuadkeyLayer({
        data: quadkeys,
        opacity: 0.8,
        filled: true,
        stroked: false,
        extruded: true,
        elevationScale: 100,
        getElevation: f => 100 * f.value,
        getQuadkey: f => f.quadkey,
        getFillColor: f => [f.value * 255, (1 - f.value) * 255, (1 - f.value) * 128],
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/quadkey-layer-extruded.png'
  },
  {
    name: 'quadkey-layer-world',
    viewState: {
      latitude: 0,
      longitude: 0,
      zoom: 0,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new QuadkeyLayer({
        data: ['0', '00', '000', '33'],
        opacity: 0.6,
        getQuadkey: f => f,
        filled: false,
        stroked: true,
        lineWidthMinPixels: 4,
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/quadkey-layer-world.png'
  }
];
