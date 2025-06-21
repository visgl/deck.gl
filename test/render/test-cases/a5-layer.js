// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {A5Layer} from '@deck.gl/geo-layers';
import {pentagons} from 'deck.gl-test/data';

export default [
  {
    name: 'a5-layer-flat',
    viewState: {
      latitude: 37.75,
      longitude: -122.45,
      zoom: 11,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new A5Layer({
        data: pentagons,
        opacity: 0.8,
        filled: true,
        stroked: false,
        getPentagon: f => f.pentagon,
        getFillColor: f => {
          const value = f.count / 211;
          return [(1 - value) * 235, 255 - 85 * value, 255 - 170 * value];
        },
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/a5-layer-flat.png'
  },
  {
    name: 'a5-layer',
    viewState: {
      latitude: 37.78,
      longitude: -122.45,
      zoom: 10.5,
      pitch: 40,
      bearing: 0
    },
    layers: [
      new A5Layer({
        data: pentagons,
        opacity: 0.8,
        filled: true,
        extruded: true,
        getPentagon: f => f.pentagon,
        getFillColor: f => {
          const value = f.count / 211;
          return [(1 - value) * 235, 255 - 85 * value, 255 - 170 * value];
        },
        getElevation: f => f.count,
        elevationScale: 30,
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/a5-layer.png'
  }
];
