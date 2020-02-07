import {HeatmapLayer} from '@deck.gl/aggregation-layers';
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
        pickable: false,
        getPosition: d => d.COORDINATES,
        radiusPixels: 35,
        threshold: 0.1
      })
    ],
    goldenImage: './test/render/golden-images/heatmap-lnglat.png'
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
        pickable: false,
        getPosition: d => d.COORDINATES,
        radiusPixels: 35,
        threshold: 0.1
      })
    ],
    goldenImage: './test/render/golden-images/heatmap-lnglat-high-zoom.png'
  }
];
