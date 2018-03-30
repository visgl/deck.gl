/* global DeckGL, document */
/* eslint-disable no-unused-vars */
import '../src';

const data = [
  {position: [100, 100], color: [255, 0, 0]},
  {position: [200, 200], color: [250, 180, 0]},
  {position: [300, 300], color: [0, 180, 200]}
];

const geoExample = new DeckGL({
  mapboxApiAccessToken: __MAPBOX_TOKEN__, // eslint-disable-line
  container: document.getElementById('geo'),
  longitude: -122.45,
  latitude: 37.8,
  zoom: 12,
  layers: [
    new DeckGL.ScatterplotLayer({
      coordinateSystem: DeckGL.COORDINATE_SYSTEM.METER_OFFSETS,
      coordinateOrigin: [-122.45, 37.8],
      data,
      radiusScale: 100
    })
  ]
});

const nonGeoExample = new DeckGL({
  container: document.getElementById('non-geo'),
  mapbox: false /* disable map */,
  views: [new DeckGL.experimental.OrthographicView({width: '100%', height: '100%'})],
  viewState: {left: 0, top: 0},
  layers: [
    new DeckGL.ScatterplotLayer({
      id: 'scatterplot',
      coordinateSystem: DeckGL.COORDINATE_SYSTEM.IDENTITY,
      opacity: 1,
      data,
      radiusScale: 10
    })
  ]
});
