import mapboxgl from 'mapbox-gl';
import {Deck} from '@deck.gl/core';
import {CartoSQLLayer, CartoBQTilerLayer, setDefaultCredentials} from '@deck.gl/carto';

const INITIAL_VIEW_STATE = {
  latitude: 0,
  longitude: 0,
  zoom: 1
};

setDefaultCredentials({
  username: 'public',
  apiKey: 'default_public'
});

// Add Mapbox GL for the basemap. It's not a requirement if you don't need a basemap.
const map = new mapboxgl.Map({
  container: 'map',
  style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  interactive: false,
  center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
  zoom: INITIAL_VIEW_STATE.zoom
});

// Define color breaks for CartoBQTilerLayer
const BUILDINGS_COLORS = {
  ONE_MILLION: [207, 89, 126],
  HUNDRED_THOUSAND: [232, 133, 113],
  TEN_THOUSAND: [238, 180, 121],
  THOUSAND: [233, 226, 156],
  HUNDRED: [156, 203, 134],
  TEN: [57, 177, 133],
  OTHER: [0, 147, 146]
};

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
    new CartoSQLLayer({
      id: 'airports',
      data: 'SELECT * FROM ne_10m_airports',
      visible: visibleLayer === 'airports',
      filled: true,
      pointRadiusMinPixels: 2,
      pointRadiusScale: 2000,
      getRadius: f => 11 - f.properties.scalerank,
      getFillColor: [200, 0, 80, 180],
      autoHighlight: true,
      highlightColor: [0, 0, 128, 128],
      pickable: true
    }),
    new CartoBQTilerLayer({
      id: 'osm_buildings',
      data: 'cartobq.maps.osm_buildings',
      visible: visibleLayer === 'building',
      getFillColor: object => {
        // Apply color based on an attribute
        if (object.properties.aggregated_total > 1000000) {
          return BUILDINGS_COLORS.ONE_MILLION;
        } else if (object.properties.aggregated_total > 100000) {
          return BUILDINGS_COLORS.HUNDRED_THOUSAND;
        } else if (object.properties.aggregated_total > 10000) {
          return BUILDINGS_COLORS.TEN_THOUSAND;
        } else if (object.properties.aggregated_total > 1000) {
          return BUILDINGS_COLORS.THOUSAND;
        } else if (object.properties.aggregated_total > 100) {
          return BUILDINGS_COLORS.HUNDRED;
        } else if (object.properties.aggregated_total > 10) {
          return BUILDINGS_COLORS.TEN;
        }
        return BUILDINGS_COLORS.OTHER;
      },
      pointRadiusMinPixels: 2,
      stroked: false
    })
  ];
  // update layers in deck.gl.
  deck.setProps({layers});
}
