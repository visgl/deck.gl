// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {GeohashLayer} from '@deck.gl/geo-layers';
import {geohashes} from 'deck.gl-test/data';

export default [
  {
    name: 'geohash-layer',
    viewState: {
      latitude: 37.75,
      longitude: -122.45,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new GeohashLayer({
        data: geohashes,
        opacity: 0.8,
        filled: true,
        stroked: false,
        getGeohash: f => f.geohash,
        getFillColor: f => [f.value * 255, (1 - f.value) * 255, (1 - f.value) * 128],
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/geohash-layer.png'
  },
  {
    name: 'geohash-layer-extruded',
    viewState: {
      latitude: 37.79,
      longitude: -122.45,
      zoom: 10.5,
      pitch: 50,
      bearing: 10
    },
    layers: [
      new GeohashLayer({
        data: geohashes,
        opacity: 0.8,
        filled: true,
        stroked: false,
        extruded: true,
        elevationScale: 100,
        getElevation: f => 100 * f.value,
        getGeohash: f => f.geohash,
        getFillColor: f => [f.value * 255, (1 - f.value) * 128, (1 - f.value) * 255],
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/geohash-layer-extruded.png'
  },
  {
    name: 'geohash-layer-world',
    viewState: {
      latitude: 0,
      longitude: 0,
      zoom: 0,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new GeohashLayer({
        data: ['g', 'e', 'x', '8'],
        opacity: 0.6,
        getGeohash: f => f,
        filled: false,
        stroked: true,
        lineWidthMinPixels: 4,
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/geohash-layer-world.png'
  }
];
