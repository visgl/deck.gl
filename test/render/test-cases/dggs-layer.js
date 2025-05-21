// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {GlobalGridLayer} from '@deck.gl/geo-layers';
import {pentagons} from 'deck.gl-test/data';

export default [
  {
    name: 'global-grid-layer',
    viewState: {
      latitude: 37.75,
      longitude: -122.45,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new GlobalGridLayer({
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
    goldenImage: './test/render/golden-images/global-grid-layer.png'
  },
  {
    name: 'global-grid-layer-flat',
    viewState: {
      latitude: 37.78,
      longitude: -122.45,
      zoom: 10.5,
      pitch: 40,
      bearing: 0
    },
    layers: [
      new GlobalGridLayer({
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
        elevationScale: 50,
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/global-grid-layer.png'
  }
];
