// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe} from 'vitest';
import {runRenderTestSuite} from '../render-test-suite';
import type {TestCase} from '../deck-test-utils';

import {BitmapLayer} from '@deck.gl/layers';
import {Field, FixedSizeList, Float64, Uint16, vectorFromArray} from 'apache-arrow';

const testCases = [
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
        _imageCoordinateSystem: 'lnglat'
      })
    ],
    goldenImage: './test/render/golden-images/bitmap-imagecoordinates.png'
  }
];

// Golden: the same icon atlas and orientation as the bounds-generated bitmap.
for (const indexed of [true, false]) {
  const corners = [
    [-122.45, 37.7],
    [-122.45, 37.8],
    [-122.35, 37.8],
    [-122.35, 37.7]
  ];
  const uvs = [
    [0, 1],
    [0, 0],
    [1, 0],
    [1, 1]
  ];
  const order = [0, 2, 1, 0, 3, 2];
  const column = (rows: number[][]) =>
    vectorFromArray(rows, new FixedSizeList(2, new Field('value', new Float64(), false)));
  testCases.push({
    ...testCases[0],
    name: `bitmap-typed-${indexed ? 'indexed' : 'triangles'}`,
    layers: [
      new BitmapLayer({
        opacity: 0.8,
        image: '/test/data/icon-atlas.png',
        positions: column(indexed ? corners : order.map(i => corners[i])),
        texCoords: column(indexed ? uvs : order.map(i => uvs[i])),
        indices: indexed ? vectorFromArray(order, new Uint16()) : null
      })
    ]
  });
}

describe.each(['webgl', 'webgpu'] as const)('%s', deviceType => {
  runRenderTestSuite(testCases as TestCase[], deviceType);
});
