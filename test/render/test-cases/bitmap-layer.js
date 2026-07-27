// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {BitmapLayer} from '@deck.gl/layers';

export default [
  {
    name: 'bitmap-layer',
    viewState: {
      latitude: 37.75,
      longitude: -122.4,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new BitmapLayer({
        opacity: 0.8,
        bounds: [-122.45, 37.7, -122.35, 37.8],
        image: '/test/data/icon-atlas.png'
      })
    ],
    goldenImage: './test/render/golden-images/bitmap.png'
  },
  {
    name: 'bitmap-layer-imagecoordinates',
    viewState: {
      latitude: 0,
      longitude: 0,
      zoom: 1,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new BitmapLayer({
        bounds: [-180, -90, 180, 90],
        image: '/test/data/world.jpg',
        _imageCoordinateSystem: COORDINATE_SYSTEM.LNGLAT
      })
    ],
    goldenImage: './test/render/golden-images/bitmap-imagecoordinates.png'
  }
];
