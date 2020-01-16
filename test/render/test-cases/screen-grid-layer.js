import {OrthographicView, COORDINATE_SYSTEM} from '@deck.gl/core';
import {ScreenGridLayer} from '@deck.gl/aggregation-layers';
import {points} from 'deck.gl-test/data';

import {WIDTH, HEIGHT} from '../constants';

export const screenSpaceData = [
  [0, -100],
  [0, -110],
  [0, -115],
  [10, -100],
  [0, 100],
  [0, 105],
  [-100, -100],
  [-100, -100],
  [100, 10],
  [100, 12],
  [100, 100],
  [110, 90]
];

export default [
  {
    name: 'screengrid-infoviz',
    views: [new OrthographicView()],
    viewState: {
      left: -WIDTH / 2,
      top: -HEIGHT / 2,
      right: WIDTH / 2,
      bottom: HEIGHT / 2
    },
    layers: [
      new ScreenGridLayer({
        id: 'screengrid-infoviz',
        data: screenSpaceData,
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        opacity: 0.8,
        getPosition: d => d,
        cellSizePixels: 40,
        pickable: false
      })
    ],
    goldenImage: './test/render/golden-images/screengrid-infoviz.png'
  },
  {
    name: 'screengrid-lnglat-cpu-aggregation',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ScreenGridLayer({
        id: 'screengrid-lnglat-cpu-aggregation',
        data: points,
        opacity: 0.8,
        getPosition: d => d.COORDINATES,
        cellSizePixels: 40,
        pickable: false,
        gpuAggregation: false
      })
    ],
    goldenImage: './test/render/golden-images/screengrid-lnglat-colorRange.png'
  },
  {
    name: 'screengrid-lnglat-colorRange',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ScreenGridLayer({
        id: 'screengrid-lnglat-colorRange',
        data: points,
        opacity: 0.8,
        getPosition: d => d.COORDINATES,
        cellSizePixels: 40,
        pickable: false
      })
    ],
    goldenImage: './test/render/golden-images/screengrid-lnglat-colorRange.png'
  }
];
