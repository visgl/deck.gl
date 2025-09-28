// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {HeatmapLayer} from '@deck.gl/aggregation-layers';
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {points} from 'deck.gl-test/data';

export default [
  {
    name: 'heatmap-lnglat',
    viewState: {
      latitude: 37.75,
      longitude: -122.44,
      zoom: 11.5,
      pitch: 30,
      bearing: 0
    },
    layers: [
      new HeatmapLayer({
        id: 'heatmap-lnglat',
        data: points,
        opacity: 0.8,
        getPosition: d => d.COORDINATES,
        getWeight: d => d.SPACES,
        radiusPixels: 35,
        threshold: 0.1
      })
    ],
    goldenImage: './test/render/golden-images/heatmap-lnglat.png'
  },
  {
    name: 'heatmap-lnglat-mean',
    viewState: {
      latitude: 37.75,
      longitude: -122.44,
      zoom: 11.5,
      pitch: 30,
      bearing: 0
    },
    layers: [
      new HeatmapLayer({
        id: 'heatmap-lnglat',
        data: points,
        opacity: 0.8,
        aggregation: 'MEAN',
        getPosition: d => d.COORDINATES,
        getWeight: d => d.SPACES,
        radiusPixels: 35,
        threshold: 0.05
      })
    ],
    goldenImage: './test/render/golden-images/heatmap-lnglat-mean.png'
  },
  {
    name: 'heatmap-lnglat-high-zoom',
    viewState: {
      latitude: 37.76,
      longitude: -122.42,
      zoom: 14,
      pitch: 30,
      bearing: 0
    },
    layers: [
      new HeatmapLayer({
        id: 'heatmap-lnglat-2',
        data: points,
        opacity: 0.8,
        getPosition: d => d.COORDINATES,
        radiusPixels: 35,
        threshold: 0.1
      })
    ],
    goldenImage: './test/render/golden-images/heatmap-lnglat-high-zoom.png'
  },
  {
    name: 'heatmap-lnglat-high-precision',
    viewState: {
      latitude: 37.76,
      longitude: -122.42,
      zoom: 22,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new HeatmapLayer({
        id: 'heatmap-lnglat-high-precision',
        data: points,
        getPosition: d => [
          (d.COORDINATES[0] + 122.42) / 1000 - 122.42,
          (d.COORDINATES[1] - 37.76) / 1000 + 37.76
        ],
        radiusPixels: 35
      })
    ],
    goldenImage: './test/render/golden-images/heatmap-lnglat-high-precision.png'
  },
  {
    name: 'heatmap-lnglat-offset',
    viewState: {
      latitude: 37.75,
      longitude: -122.44,
      zoom: 11.5,
      pitch: 30,
      bearing: 0
    },
    layers: [
      new HeatmapLayer({
        id: 'heatmap-lnglat-offset',
        data: points,
        opacity: 0.8,
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT_OFFSETS,
        coordinateOrigin: [-122.42, 37.76],
        getPosition: d => [d.COORDINATES[0] + 122.42, d.COORDINATES[1] - 37.76],
        getWeight: d => d.SPACES,
        radiusPixels: 35,
        threshold: 0.1
      })
    ],
    goldenImage: './test/render/golden-images/heatmap-lnglat.png'
  }
];
