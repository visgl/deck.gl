import {TripsLayer} from '@deck.gl/geo-layers';
import {trips} from 'deck.gl-test/data';

export default [
  {
    name: 'trips-layer-3d',
    viewState: {
      latitude: 37.75,
      longitude: -122.45,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new TripsLayer({
        id: 'trips-3d',
        data: trips,
        opacity: 0.8,
        getPath: d => [d[0].begin_shape].concat(d.map(leg => leg.end_shape)),
        getTimestamps: d => [d[0].begin_time].concat(d.map(leg => leg.end_time)),
        getColor: [253, 128, 93],
        widthMinPixels: 4,
        rounded: true,
        trailLength: 500,
        currentTime: 500
      })
    ],
    goldenImage: './test/render/golden-images/trips.png'
  }
];
