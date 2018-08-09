import {Deck} from '@deck.gl/core';
import {GeoJsonLayer} from '@deck.gl/layers';

// Outlines of US States. Source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const US_MAP_GEOJSON =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson'; //eslint-disable-line

const INITIAL_VIEW_STATE = {
  latitude: 40,
  longitude: -100,
  zoom: 11,
  // Set back the pitch to 0 (30 in the other demos)
  pitch: 0
};

function initMap() {
  const map = new google.maps.Map(
    document.getElementById('map'),
    {
      mapTypeId: 'hybrid',
      center: {
        lat: INITIAL_VIEW_STATE.latitude, 
        lng: INITIAL_VIEW_STATE.longitude
      },
      // Adding 1 to the zoom level get us close to each other
      zoom: INITIAL_VIEW_STATE.zoom+1,
      tilt: INITIAL_VIEW_STATE.pitch,
      gestureHandling: 'none'
    }
  );
  
  const deck = new Deck({
    canvas: 'deck-canvas',
    width: '100%',
    height: '100%',
    initialViewState: INITIAL_VIEW_STATE,
    // Google maps has no rotating capabilities, so we disable rotation here.
    controller: {
      dragRotate: false
    },
    onViewStateChange: ({viewState}) => {
      map.setOptions({
        center: {
          lat: viewState.latitude, 
          lng: viewState.longitude
        },
        // Adding 1 to the zoom level get us close to each other
        zoom: viewState.zoom+1,
        tilt: viewState.pitch,
      });
    },
    layers: [
      new GeoJsonLayer({
        data: US_MAP_GEOJSON,
        stroked: true,
        filled: true,
        lineWidthMinPixels: 2,
        opacity: 0.4,
        getLineColor: [255, 100, 100],
        getFillColor: [200, 160, 0, 180]
      })
    ]
  });
}

window.initMap = initMap;