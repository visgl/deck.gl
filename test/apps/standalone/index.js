/* global deck, document */
/* eslint-disable no-unused-vars */
import 'deck.gl/../bundle';
import {choropleths} from '../../../examples/layer-browser/src/data-samples';

const SAMPLE_SIZE = 10;
const points = [];

for (let x = 0; x < SAMPLE_SIZE; x++) {
  for (let y = 0; y < SAMPLE_SIZE; y++) {
    for (let z = 0; z < SAMPLE_SIZE; z++) {
      points.push({
        position: [x - SAMPLE_SIZE / 2, y - SAMPLE_SIZE / 2, z - SAMPLE_SIZE / 2],
        color: [(x / SAMPLE_SIZE) * 255, (y / SAMPLE_SIZE) * 255, (z / SAMPLE_SIZE) * 255]
      });
    }
  }
}

const geoExample = new deck.DeckGL({
  mapboxApiAccessToken: __MAPBOX_TOKEN__, // eslint-disable-line
  container: document.getElementById('geo'),
  initialViewState: {
    longitude: -122.45,
    latitude: 37.78,
    zoom: 11,
    pitch: 30
  },
  controller: true,
  onViewStateChange: console.log, // eslint-disable-line
  layers: [
    new deck.GeoJsonLayer({
      data: choropleths,
      extruded: true,
      wireframe: true,
      fp64: true,
      getElevation: d => d.properties.OBJECTID * 100,
      getLineColor: d => [255, 255, 255],
      getFillColor: d => [0, 50, 100]
    })
  ]
});

const nonGeoExample = new deck.DeckGL({
  container: document.getElementById('non-geo'),
  mapbox: false /* disable map */,
  views: [new deck.OrbitView()],
  initialViewState: {distance: 1, fov: 50, rotationX: 45, rotationOrbit: 30, zoom: 0.05},
  controller: true,
  layers: [
    new deck.PointCloudLayer({
      id: 'pointCloud',
      coordinateSystem: deck.COORDINATE_SYSTEM.IDENTITY,
      opacity: 1,
      data: points,
      getPosition: d => d.position,
      getColor: d => d.color,
      getNormal: [0, 0, 1],
      pointSize: 10
    })
  ]
});
