import mapboxgl from 'mapbox-gl';
import {Deck} from '@deck.gl/core';
import {
  CartoLayer,
  setDefaultCredentials,
  BASEMAP,
  colorBins,
  API_VERSIONS,
  MAP_TYPES
} from '@deck.gl/carto';

const INITIAL_VIEW_STATE = {
  latitude: 0,
  longitude: 0,
  zoom: 1
};

setDefaultCredentials({
  apiVersion: API_VERSIONS.V2,
  username: 'public',
  apiKey: 'default_public'
});

// Add Mapbox GL for the basemap. It's not a requirement if you don't need a basemap.
const map = new mapboxgl.Map({
  container: 'map',
  style: BASEMAP.VOYAGER,
  interactive: false,
  center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
  zoom: INITIAL_VIEW_STATE.zoom
});

// Set the default visible layer
let visibleLayer = 'airports';

// Create Deck.GL map
export const deck = new Deck({
  canvas: 'deck-canvas',
  width: '100%',
  height: '100%',
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  onViewStateChange: ({viewState}) => {
    // Synchronize Deck.gl view with Mapbox
    map.jumpTo({
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      bearing: viewState.bearing,
      pitch: viewState.pitch
    });
  }
});

// Add event listener to radio buttons
document.getElementsByName('layer-visibility').forEach(e => {
  e.addEventListener('click', () => {
    visibleLayer = e.value;
    render();
  });
});

render();

// Function to render the layers. Will be invoked any time visibility changes.
function render() {
  const layers = [
    new CartoLayer({
      id: 'airports',
      type: MAP_TYPES.QUERY,
      data: 'SELECT cartodb_id, the_geom_webmercator, scalerank FROM ne_10m_airports',
      visible: visibleLayer === 'airports',
      filled: true,
      pointRadiusMinPixels: 2,
      pointRadiusScale: 2000,
      getPointRadius: f => 11 - f.properties.scalerank,
      getFillColor: [200, 0, 80, 180],
      autoHighlight: true,
      highlightColor: [0, 0, 128, 128],
      pickable: true
    }),

    new CartoLayer({
      id: 'osm_buildings',
      type: MAP_TYPES.TILESET,
      data: 'cartobq.maps.osm_buildings',
      visible: visibleLayer === 'building',
      getFillColor: colorBins({
        attr: 'aggregated_total',
        domain: [10, 100, 1e3, 1e4, 1e5, 1e6],
        colors: 'Temps'
      }),
      pointRadiusMinPixels: 2,
      stroked: false
    })
  ];
  // update layers in deck.gl.
  deck.setProps({layers});
}
