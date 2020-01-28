import {OrthographicView, COORDINATE_SYSTEM} from '@deck.gl/core';
import {ContourLayer} from '@deck.gl/aggregation-layers';
import {points} from 'deck.gl-test/data';

import {WIDTH, HEIGHT} from '../constants';
import {screenSpaceData} from './screen-grid-layer';

export default [
  {
    name: 'contour-infoviz',
    views: [new OrthographicView()],
    viewState: {
      left: -WIDTH / 2,
      top: -HEIGHT / 2,
      right: WIDTH / 2,
      bottom: HEIGHT / 2,
      zoom: 0.1
    },
    layers: [
      new ContourLayer({
        id: 'contour-infoviz',
        data: screenSpaceData,
        getPosition: d => d,
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        cellSize: 40,
        contours: [
          {threshold: 1, color: [50, 50, 50]},
          {threshold: 2, color: [100, 100, 100]},
          {threshold: 3, color: [150, 150, 150]}
        ],
        gpuAggregation: true
      })
    ],
    goldenImage: './test/render/golden-images/contour-infoviz.png'
  },
  {
    name: 'contour-isobands-infoviz',
    views: [new OrthographicView()],
    viewState: {
      left: -WIDTH / 2,
      top: -HEIGHT / 2,
      right: WIDTH / 2,
      bottom: HEIGHT / 2
    },
    layers: [
      new ContourLayer({
        id: 'contour-isobands-infoviz',
        data: screenSpaceData,
        getPosition: d => d,
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        cellSize: 40,
        contours: [
          {threshold: [1, 2], color: [150, 0, 0]},
          {threshold: [2, 5], color: [0, 150, 0]}
        ],
        gpuAggregation: false
      })
    ],
    goldenImage: './test/render/golden-images/contour-infoviz_border_ref.png'
  },
  {
    name: 'contour-lnglat-cpu-aggregation',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ContourLayer({
        id: 'contour-lnglat-cpu-aggregation',
        data: points,
        cellSize: 200,
        getPosition: d => d.COORDINATES,
        contours: [
          {threshold: 1, color: [255, 0, 0], strokeWidth: 6},
          {threshold: 5, color: [0, 255, 0], strokeWidth: 3},
          {threshold: 15, color: [0, 0, 255]}
        ],
        gpuAggregation: false
      })
    ],
    goldenImage: './test/render/golden-images/contour-lnglat.png'
  },
  {
    name: 'contour-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ContourLayer({
        id: 'contour-lnglat',
        data: points,
        cellSize: 200,
        getPosition: d => d.COORDINATES,
        contours: [
          {threshold: 1, color: [255, 0, 0], strokeWidth: 6},
          {threshold: 5, color: [0, 255, 0], strokeWidth: 3},
          {threshold: 15, color: [0, 0, 255]}
        ],
        gpuAggregation: true
      })
    ],
    goldenImage: './test/render/golden-images/contour-lnglat.png'
  },
  {
    name: 'contour-isobands-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ContourLayer({
        id: 'contour-isobands-lnglat',
        data: points,
        cellSize: 200,
        getPosition: d => d.COORDINATES,
        contours: [
          {threshold: [1, 5], color: [255, 0, 0], strokeWidth: 6},
          {threshold: [5, 15], color: [0, 255, 0], strokeWidth: 3},
          {threshold: [15, 1000], color: [0, 0, 255]}
        ],
        gpuAggregation: true
      })
    ],
    goldenImage: './test/render/golden-images/contour-isobands-lnglat.png'
  }
];
