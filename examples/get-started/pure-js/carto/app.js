import mapboxgl from 'mapbox-gl';
import {Deck} from '@deck.gl/core';
import {
  CartoLayer,
  CartoSQLLayer,
  CartoBQTilerLayer,
  setDefaultCredentials,
  setConfig,
  BASEMAP,
  colorBins,
  MODES,
  PROVIDERS,
  MAP_TYPES
} from '@deck.gl/carto';

const INITIAL_VIEW_STATE = {
  latitude: 0,
  longitude: 0,
  zoom: 1
};

// setDefaultCredentials({
//   username: 'public',
//   apiKey: 'default_public'
// })

setConfig({
  mode: MODES.CARTO,
  username: 'public',
  apiKey: 'default_public'
});

// setConfig({
//   mode: MODES.CARTO_CLOUD_NATIVE,
//   accessToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlJYVnRIYUdzaTUxMFZZYml1YjA5ZCJ9.eyJodHRwOi8vRjNrSjlSaFFoRU1BaHQxUUJZZEFJbnJEUU1ySlZSOHUuYXBwL2VtYWlsIjoiYWxiZXJ0b0BjYXJ0b2RiLmNvbSIsImh0dHA6Ly9GM2tKOVJoUWhFTUFodDFRQllkQUluckRRTXJKVlI4dS5hcHAvYWNjb3VudF9pZCI6ImFjX3lucTJsdTQiLCJpc3MiOiJodHRwczovL2NhcnRvLWRldmVsb3BtZW50LnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1dGgyfDEwODQwOTU2MzM0MTM1OTA0MTY4NCIsImF1ZCI6ImNhcnRvLWNsb3VkLW5hdGl2ZS1hcGkiLCJpYXQiOjE2MTk3MTQ2NDMsImV4cCI6MTYxOTgwMTA0MywiYXpwIjoiRjNrSjlSaFFoRU1BaHQxUUJZZEFJbnJEUU1ySlZSOHUiLCJzY29wZSI6InJlYWQ6Y3VycmVudF91c2VyIiwicGVybWlzc2lvbnMiOlsiYWRtaW46YWNjb3VudCIsInJlYWQ6YWNjb3VudCIsInJlYWQ6YXBwcyIsInJlYWQ6Y29ubmVjdGlvbnMiLCJyZWFkOmN1cnJlbnRfdXNlciIsInJlYWQ6bWFwcyIsInJlYWQ6dGlsZXNldHMiLCJ1cGRhdGU6Y3VycmVudF91c2VyIiwid3JpdGU6YXBwcyIsIndyaXRlOmNvbm5lY3Rpb25zIiwid3JpdGU6bWFwcyJdfQ.hSF1YbKqUi-A85LKwxdv0GUmccwOpuujEukMLt5Bx5ebXWaW0PQlrumtZX79Szv0i2liIOnZpIeYM5VLsBG8pFPpPauXVqVaTmwF2daZ5mRwK9iigLvcdO8ZIlbdC9Wm1hr8d9L_DFElWp0ZRzuNx4KjPFji47xAEVm_WgiX68z6MFMTDnh420pONW6_OI2AAJsyZ3aQps8Ju48SQfHd4WWzpiBD_AQcMBdEoNng39z51Bl1MoFEEsqOrxcyoAx62HY-ZnJNzt8hZ00xE_8GHRtQTiG0nT50SRwZkXgNsVtqMw1LbUIxaStzawGj3IiWr4rIgpgTosgF96LDAlrOpw',
//   mapsUrl: 'http://localhost:8002'
// });

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
    // // TOREMOVE
    // new CartoSQLLayer({
    //   id: 'airports_toremove',
    //   data: 'SELECT cartodb_id, the_geom_webmercator, scalerank FROM ne_10m_airports',
    //   visible: true,
    //   filled: true,
    //   pointRadiusMinPixels: 2,
    //   pointRadiusScale: 2000,
    //   getRadius: f => 11 - f.properties.scalerank,
    //   getFillColor: [200, 0, 80, 180],
    //   autoHighlight: true,
    //   highlightColor: [0, 0, 128, 128],
    //   pickable: true
    // }),
    // // // TOREMOVE
    // new CartoBQTilerLayer({
    //   id: 'osm_buildings',
    //   data: 'cartobq.maps.osm_buildings',
    //   visible: visibleLayer === 'building',
    //   getFillColor: colorBins({
    //     attr: 'aggregated_total',
    //     domain: [10, 100, 1e3, 1e4, 1e5, 1e6],
    //     colors: 'Temps'
    //   }),
    //   pointRadiusMinPixels: 2,
    //   stroked: false
    // }),
    new CartoLayer({
      id: 'airports',
      mode: MODES.CARTO,
      type: MAP_TYPES.SQL,
      data: 'SELECT cartodb_id, the_geom_webmercator, scalerank FROM ne_10m_airports',
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

    new CartoLayer({
      id: 'osm_buildings',
      mode: MODES.CARTO,
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
    }),

    // new CartoLayer({
    //   id: 'osm_buildings',
    //   connection: 'dev-bigquery',
    //   provider: PROVIDERS.BIGQUERY,
    //   mode: MODES.CARTO_CLOUD_NATIVE,
    //   type: MAP_TYPES.TILESET,
    //   data: 'cartobq.maps.osm_buildings',
    //   getFillColor: colorBins({
    //     attr: 'aggregated_total',
    //     domain: [10, 100, 1e3, 1e4, 1e5, 1e6],
    //     colors: 'Temps'
    //   }),
    //   pointRadiusMinPixels: 2,
    //   stroked: false
    // }),

    // new CartoLayer({
    //   id: 'points_10k_table',
    //   connection: 'dev-bigquery',
    //   provider: PROVIDERS.BIGQUERY,
    //   mode: MODES.CARTO_CLOUD_NATIVE,
    //   type: MAP_TYPES.TABLE,
    //   data: 'cartobq.testtables.points_10k',
    //   getFillColor: [255,0,0],
    //   pointRadiusMinPixels: 2,
    //   stroked: false
    // }),

    // new CartoLayer({
    //   id: 'points_10k_sql',
    //   connection: 'dev-bigquery',
    //   provider: PROVIDERS.BIGQUERY,
    //   mode: MODES.CARTO_CLOUD_NATIVE,
    //   type: MAP_TYPES.SQL,
    //   data: 'select * from cartobq.testtables.points_10k LIMIT 5000',
    //   getFillColor: [0,255,0],
    //   pointRadiusMinPixels: 2,
    //   stroked: false
    // }),

    // new CartoLayer({
    //   id: 'points_10k_',
    //   mode: MODES.CARTO_CLOUD_NATIVE,
    //   connection: 'dev-redshift',
    //   provider: PROVIDERS.REDSHIFT,
    //   type: MAP_TYPES.SQL,
    //   data: 'select * from polygons_10k',
    //   getFillColor: [0,255,0],
    //   pointRadiusMinPixels: 10,
    //   stroked: false,
    //   config: {
    //     accessToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlJYVnRIYUdzaTUxMFZZYml1YjA5ZCJ9.eyJodHRwOi8vRjNrSjlSaFFoRU1BaHQxUUJZZEFJbnJEUU1ySlZSOHUuYXBwL2VtYWlsIjoiYWxiZXJ0b0BjYXJ0b2RiLmNvbSIsImh0dHA6Ly9GM2tKOVJoUWhFTUFodDFRQllkQUluckRRTXJKVlI4dS5hcHAvYWNjb3VudF9pZCI6ImFjX3lucTJsdTQiLCJpc3MiOiJodHRwczovL2NhcnRvLWRldmVsb3BtZW50LnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1dGgyfDEwODQwOTU2MzM0MTM1OTA0MTY4NCIsImF1ZCI6ImNhcnRvLWNsb3VkLW5hdGl2ZS1hcGkiLCJpYXQiOjE2MTk3MTQ2NDMsImV4cCI6MTYxOTgwMTA0MywiYXpwIjoiRjNrSjlSaFFoRU1BaHQxUUJZZEFJbnJEUU1ySlZSOHUiLCJzY29wZSI6InJlYWQ6Y3VycmVudF91c2VyIiwicGVybWlzc2lvbnMiOlsiYWRtaW46YWNjb3VudCIsInJlYWQ6YWNjb3VudCIsInJlYWQ6YXBwcyIsInJlYWQ6Y29ubmVjdGlvbnMiLCJyZWFkOmN1cnJlbnRfdXNlciIsInJlYWQ6bWFwcyIsInJlYWQ6dGlsZXNldHMiLCJ1cGRhdGU6Y3VycmVudF91c2VyIiwid3JpdGU6YXBwcyIsIndyaXRlOmNvbm5lY3Rpb25zIiwid3JpdGU6bWFwcyJdfQ.hSF1YbKqUi-A85LKwxdv0GUmccwOpuujEukMLt5Bx5ebXWaW0PQlrumtZX79Szv0i2liIOnZpIeYM5VLsBG8pFPpPauXVqVaTmwF2daZ5mRwK9iigLvcdO8ZIlbdC9Wm1hr8d9L_DFElWp0ZRzuNx4KjPFji47xAEVm_WgiX68z6MFMTDnh420pONW6_OI2AAJsyZ3aQps8Ju48SQfHd4WWzpiBD_AQcMBdEoNng39z51Bl1MoFEEsqOrxcyoAx62HY-ZnJNzt8hZ00xE_8GHRtQTiG0nT50SRwZkXgNsVtqMw1LbUIxaStzawGj3IiWr4rIgpgTosgF96LDAlrOpw'
    //   }
    // }),
    
  ];
  // update layers in deck.gl.
  deck.setProps({layers});
}
