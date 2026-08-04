// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {OrthographicView} from '@deck.gl/core';
import {PathLayer, ScatterplotLayer, SolidPolygonLayer} from '@deck.gl/layers';

// biome-ignore format: preserve layout
const BINARY_DATA = [
  0.7, 0.2, 0, 0, 0, 0,
  0.8, 0.6, 0, 0, 5, 0,
  0.3, 0.5, 0, 5, 5, 0,
  0, 0.8, 0.6, 5, 10, 0,
  0, 0.5, 0.7, 10, 10, 0,
  0.3, 0, 0.8, 10, 15, 0,
  0.8, 0, 0.6, 15, 15, 0
];

export default [
  {
    name: 'binary',
    views: new OrthographicView(),
    viewState: {
      target: [7, 7, 0],
      zoom: 4.5
    },
    layers: [
      new SolidPolygonLayer({
        id: 'binary-polygons',
        data: {
          length: 2,
          startIndices: [0, 3],
          attributes: {
            indices: new Uint16Array([0, 1, 2, 3, 4, 5, 4, 5, 6]),
            getPolygon: {value: new Float64Array(BINARY_DATA), size: 3, offset: 24, stride: 48},
            getFillColor: {
              value: new Float32Array(BINARY_DATA),
              size: 3,
              stride: 24,
              normalized: false
            }
          }
        },
        _normalize: false,
        getWidth: 0.5
      }),
      new PathLayer({
        id: 'binary-paths',
        data: {
          length: 2,
          startIndices: [0, 3],
          attributes: {
            getPath: {value: new Float32Array(BINARY_DATA), size: 3, offset: 12, stride: 24},
            getColor: {value: new Float32Array(BINARY_DATA), size: 3, stride: 24, normalized: false}
          }
        },
        _pathType: 'open',
        getWidth: 0.5
      }),
      new ScatterplotLayer({
        id: 'binary-points',
        data: {
          length: 7,
          attributes: {
            getPosition: {value: new Float64Array(BINARY_DATA), size: 3, offset: 24, stride: 48},
            getFillColor: {
              value: new Float32Array(BINARY_DATA),
              size: 3,
              stride: 24,
              normalized: false
            }
          }
        },
        getRadius: 1
      })
    ],
    goldenImage: './test/render/golden-images/binary.png'
  }
];
